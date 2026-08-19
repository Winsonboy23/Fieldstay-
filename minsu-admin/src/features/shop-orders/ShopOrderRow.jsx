import styled from "styled-components";
import {
  HiOutlineBanknotes,
  HiOutlineCheckCircle,
  HiOutlineEnvelope,
  HiOutlineTrash,
  HiOutlineTruck,
  HiOutlineXCircle,
} from "react-icons/hi2";
import toast from "react-hot-toast";

import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";
import { formatCurrency } from "../../utils/helpers";
import { getFrontendUrl } from "../../utils/frontendUrl";
import { getTemperature } from "../../utils/productTemperature";
import { useUpdateShopOrder, useDeleteShopOrder } from "./useShopOrders";
import {
  notifyShopCancelled,
  notifyShopPaid,
  notifyShopShipped,
  resendShopNotification,
} from "../../services/apiNotify";

const OrderCode = styled.a`
  font-family: "Noto Sans TC", sans-serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-brand-700);
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const Stacked = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;

  & span:first-child {
    font-weight: 500;
    color: var(--color-grey-700);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  & span:last-child {
    color: var(--color-grey-500);
    font-size: 1.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const TempTag = styled.span`
  display: inline-block;
  padding: 0.1rem 0.7rem;
  border-radius: 100px;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background: ${(p) => p.$color};
  margin-right: 0.5rem;
`;

const Amount = styled.div`
  font-family: "Noto Sans TC", sans-serif;
  font-weight: 600;
  color: var(--color-grey-700);
`;

const StatusCell = styled.div`
  display: flex;
  justify-content: center;
`;

const StatusTag = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  font-size: 1.3rem;
  font-weight: 600;
  padding: 0.6rem 1.6rem;
  border-radius: 100px;
  background-color: ${(p) => p.$bg};
  color: ${(p) => p.$fg};
  min-width: 7rem;
`;

const CVS_LABEL = { UNIMART: "7-ELEVEN", FAMI: "全家" };

function shopStatusBadge(order) {
  if (order.status === "cancelled")
    return { label: "已取消", bg: "#f3f4f6", fg: "#6b7280" };
  if (order.status === "picked_up")
    return { label: "已完成", bg: "#e0e7ff", fg: "#4338ca" };
  if (order.status === "arrived")
    return { label: "已到店", bg: "#cffafe", fg: "#0e7490" };
  if (order.status === "shipped")
    return { label: "已出貨", bg: "#dbeafe", fg: "#1d4ed8" };
  if (order.status === "paid")
    return { label: "已收款", bg: "#dcfce7", fg: "#15803d" };
  return { label: "待匯款", bg: "#fef3c7", fg: "#b45309" };
}

function itemsSummary(order) {
  const items = Array.isArray(order.shop_order_items)
    ? order.shop_order_items
    : [];
  if (items.length === 0) return "—";
  const label = items[0].variant_name
    ? `${items[0].name} ${items[0].variant_name}`
    : items[0].name;
  const first = `${label} × ${items[0].quantity}`;
  return items.length === 1 ? first : `${first} 等 ${items.length} 項`;
}

function ShopOrderRow({ order }) {
  const { updateOrder, isUpdating } = useUpdateShopOrder();
  const { deleteOrder, isDeleting } = useDeleteShopOrder();

  const badge = shopStatusBadge(order);
  const temp = getTemperature(order.temperature);
  const isCvs = order.delivery_type === "cvs";
  const isCancelled = order.status === "cancelled";
  const isPending = order.status === "pending";
  const isPaid = order.status === "paid";
  const canComplete = ["shipped", "arrived"].includes(order.status);

  function handleConfirmPaid() {
    if (!window.confirm(`確認訂單 ${order.order_no} 已收到匯款？`)) return;
    updateOrder(
      { id: order.id, patch: { status: "paid" } },
      { onSuccess: () => notifyShopPaid(order.id) }
    );
  }

  function handleShip() {
    const hint = isCvs
      ? "請輸入寄件單號（ibon / FamiPort 寄件收據上的單號）"
      : "請輸入宅配託運單號";
    const logisticsNo = window.prompt(hint, order.logistics_no || "");
    if (logisticsNo === null) return;
    if (!logisticsNo.trim()) {
      toast.error("請輸入寄件單號");
      return;
    }
    updateOrder(
      {
        id: order.id,
        patch: { status: "shipped", logistics_no: logisticsNo.trim() },
      },
      { onSuccess: () => notifyShopShipped(order.id) }
    );
  }

  function handleComplete() {
    if (!window.confirm("確認此訂單已完成取貨？")) return;
    updateOrder({ id: order.id, patch: { status: "picked_up" } });
  }

  function handleCancel() {
    if (
      !window.confirm(
        `確定要取消訂單 ${order.order_no}？商品會退回庫存，並寄取消通知給顧客。`
      )
    )
      return;
    updateOrder(
      { id: order.id, patch: { status: "cancelled" } },
      { onSuccess: () => notifyShopCancelled(order.id) }
    );
  }

  async function handleResend() {
    if (!window.confirm("依訂單目前狀態重寄一封通知信給顧客？")) return;
    const res = await resendShopNotification(order.id);
    if (res.ok) toast.success("已重寄通知信");
    else toast.error("重寄失敗，請查看 console");
  }

  return (
    <Table.Row>
      <OrderCode
        href={getFrontendUrl(`/shop/thankyou?orderId=${order.id}&admin=1`)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {order.order_no}
      </OrderCode>

      <Stacked>
        <span>{itemsSummary(order)}</span>
        <span>
          <TempTag $color={temp.color}>{temp.label}</TempTag>
          {isCvs
            ? `${CVS_LABEL[order.cvs_brand] || ""} ${order.cvs_store_name || ""}（${order.cvs_store_id || ""}）`
            : "低溫宅配"}
        </span>
      </Stacked>

      <Stacked>
        <span>{order.contact_name || "—"}</span>
        <span>{order.contact_phone || "-"}</span>
      </Stacked>

      <Stacked>
        <span>{order.logistics_no || "—"}</span>
        <span>
          {order.created_at
            ? String(order.created_at).slice(0, 10).replaceAll("-", "/")
            : "-"}
        </span>
      </Stacked>

      <Amount>{formatCurrency(order.total_price || 0)}</Amount>

      <StatusCell>
        <StatusTag $bg={badge.bg} $fg={badge.fg}>
          {badge.label}
        </StatusTag>
      </StatusCell>

      <Modal>
        <Menus.Menu>
          <Menus.Toggle id={order.id} />
          <Menus.List id={order.id}>
            {isPending && (
              <Menus.Button
                icon={<HiOutlineBanknotes />}
                onClick={handleConfirmPaid}
                disabled={isUpdating}
              >
                確認收款
              </Menus.Button>
            )}

            {isPaid && (
              <Menus.Button
                icon={<HiOutlineTruck />}
                onClick={handleShip}
                disabled={isUpdating}
              >
                標記出貨
              </Menus.Button>
            )}

            {canComplete && (
              <Menus.Button
                icon={<HiOutlineCheckCircle />}
                onClick={handleComplete}
                disabled={isUpdating}
              >
                標記完成
              </Menus.Button>
            )}

            {!isCancelled && (
              <Menus.Button
                icon={<HiOutlineEnvelope />}
                onClick={handleResend}
                disabled={isUpdating}
              >
                重寄通知
              </Menus.Button>
            )}

            {(isPending || isPaid) && (
              <Menus.Button
                icon={<HiOutlineXCircle />}
                onClick={handleCancel}
                disabled={isUpdating}
              >
                取消訂單
              </Menus.Button>
            )}

            <Modal.Open opens="delete">
              <Menus.Button icon={<HiOutlineTrash />}>刪除</Menus.Button>
            </Modal.Open>
          </Menus.List>
        </Menus.Menu>

        <Modal.Window name="delete">
          <ConfirmDelete
            resourceName={`訂單 ${order.order_no}`}
            disabled={isDeleting}
            onConfirm={() => deleteOrder(order.id)}
          />
        </Modal.Window>
      </Modal>
    </Table.Row>
  );
}

export default ShopOrderRow;
