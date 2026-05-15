import { useSearchParams } from "react-router-dom";

import ActivitySignupRow from "./ActivitySignupRow";
import { useAllSignups } from "./useAllSignups";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Empty from "../../ui/Empty";
import Spinner from "../../ui/Spinner";

function signupCode(id) {
  return `AC${String(id || "").replace(/\D/g, "").padStart(12, "0")}`;
}

function matchTab(signup, tab) {
  if (tab === "cancelled") return signup.status === "cancelled";
  if (tab === "confirmed")
    return signup.status !== "cancelled" && signup.payment_status === "paid";
  if (tab === "pending")
    return signup.status !== "cancelled" && signup.payment_status !== "paid";
  return true;
}

function ActivitySignupTable({ search = "" }) {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "all";
  const { signups, isLoading } = useAllSignups();

  if (isLoading) return <Spinner />;
  if (!signups.length) return <Empty resourceName="activity signups" />;

  const keyword = search.trim().toLowerCase();
  const filtered = signups
    .filter((s) => matchTab(s, tab))
    .filter((s) => {
      if (!keyword) return true;
      const code = signupCode(s.id).toLowerCase();
      const name = (s.contact_name || "").toLowerCase();
      const title = (s.activities?.title || "").toLowerCase();
      return code.includes(keyword) || name.includes(keyword) || title.includes(keyword);
    });

  if (!filtered.length) return <Empty resourceName="activity signups" />;

  return (
    <Menus>
      <Table
        columns="1.6fr 2.2fr 1.6fr 1.3fr 0.8fr 1.2fr 1fr 3.2rem"
        minWidth="86rem"
      >
        <Table.Header>
          <div>報名編號</div>
          <div>活動名稱</div>
          <div>報名人</div>
          <div>活動日期</div>
          <div>人數</div>
          <div>金額</div>
          <div style={{ textAlign: "center" }}>狀態</div>
          <div></div>
        </Table.Header>

        <Table.Body
          data={filtered}
          render={(signup) => (
            <ActivitySignupRow key={signup.id} signup={signup} />
          )}
        />
      </Table>
    </Menus>
  );
}

export default ActivitySignupTable;
