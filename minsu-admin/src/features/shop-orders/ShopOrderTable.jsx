import { useSearchParams } from "react-router-dom";

import ShopOrderRow from "./ShopOrderRow";
import { useShopOrders } from "./useShopOrders";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Empty from "../../ui/Empty";
import Spinner from "../../ui/Spinner";

function matchTab(order, tab) {
  if (tab === "pending") return order.status === "pending";
  if (tab === "paid") return order.status === "paid";
  if (tab === "shipped") return ["shipped", "arrived"].includes(order.status);
  if (tab === "completed") return order.status === "picked_up";
  if (tab === "cancelled") return order.status === "cancelled";
  return true;
}

function ShopOrderTable({ search = "" }) {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "all";
  const { orders, isLoading } = useShopOrders();

  if (isLoading) return <Spinner />;
  if (!orders.length) return <Empty resourceName="shop orders" />;

  const keyword = search.trim().toLowerCase();
  const filtered = orders
    .filter((o) => matchTab(o, tab))
    .filter((o) => {
      if (!keyword) return true;
      const no = (o.order_no || "").toLowerCase();
      const name = (o.contact_name || "").toLowerCase();
      const items = Array.isArray(o.shop_order_items) ? o.shop_order_items : [];
      const itemHit = items.some((item) =>
        (item.name || "").toLowerCase().includes(keyword)
      );
      return no.includes(keyword) || name.includes(keyword) || itemHit;
    });

  if (!filtered.length) return <Empty resourceName="shop orders" />;

  return (
    <Menus>
      <Table
        columns="1.5fr 2.4fr 1.4fr 1.5fr 1.1fr 1fr 3.2rem"
        minWidth="86rem"
      >
        <Table.Header>
          <div>訂單編號</div>
          <div>商品／取貨方式</div>
          <div>收件人</div>
          <div>寄件單號／日期</div>
          <div>金額</div>
          <div style={{ textAlign: "center" }}>狀態</div>
          <div></div>
        </Table.Header>

        <Table.Body
          data={filtered}
          render={(order) => <ShopOrderRow key={order.id} order={order} />}
        />
      </Table>
    </Menus>
  );
}

export default ShopOrderTable;
