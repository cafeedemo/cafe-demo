"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";

function revalidateOrderPaths() {
  revalidatePath("/admin/orders");
  revalidatePath("/orders");
  revalidatePath("/admin");
}

const OrderItemSchema = z.object({
  menuItemId: z.string().min(1),
  qty: z.coerce.number().int().min(1).max(50),
});

const OrderSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(7),
  tableId: z.string().optional(),
  items: z.array(OrderItemSchema).min(1),
});

export type CreateOrderInput = z.infer<typeof OrderSchema>;

export async function createOrder(input: CreateOrderInput) {
  const parsed = OrderSchema.parse(input);

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: parsed.items.map((i) => i.menuItemId) } },
  });

  const items = parsed.items.map((i) => {
    const menuItem = menuItems.find((m) => m.id === i.menuItemId);
    if (!menuItem) throw new Error("Menu item not found");
    return { menuItem, qty: i.qty };
  });

  const total = items.reduce((sum, i) => sum + Number(i.menuItem.price) * i.qty, 0);

  const order = await prisma.order.create({
    data: {
      customerName: parsed.customerName,
      customerPhone: parsed.customerPhone,
      tableId: parsed.tableId || null,
      total,
      items: {
        create: items.map((i) => ({
          menuItemId: i.menuItem.id,
          name: i.menuItem.name,
          price: i.menuItem.price,
          qty: i.qty,
        })),
      },
    },
  });

  revalidateOrderPaths();
  return order.id;
}

export async function lookupOrdersByPhone(phone: string) {
  const orders = await prisma.order.findMany({
    where: { customerPhone: phone.trim() },
    include: { items: true, table: true },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((o) => ({
    id: o.id,
    total: o.total.toString(),
    status: o.status,
    paymentStatus: o.paymentStatus,
    tableLabel: o.table?.label ?? null,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price.toString() })),
  }));
}

export async function updateOrderStatus(id: string, status: "PLACED" | "PREPARING" | "SERVED" | "CANCELLED") {
  await requireStaff();
  await prisma.order.update({ where: { id }, data: { status } });
  revalidateOrderPaths();
}

// Called from the public pay page — just records the customer's chosen
// intent, it does NOT mark the bill as paid (staff confirm that in person).
export async function setCounterPaymentIntent(tableId: string) {
  await prisma.order.updateMany({
    where: { tableId, paymentStatus: "PENDING" },
    data: { paymentMode: "COUNTER" },
  });
  revalidateOrderPaths();
}

export async function confirmCounterPaymentReceived(tableId: string) {
  await requireStaff();
  await prisma.order.updateMany({
    where: { tableId, paymentStatus: "PENDING" },
    data: { paymentStatus: "PAID", paymentMode: "COUNTER" },
  });
  revalidateOrderPaths();
}
