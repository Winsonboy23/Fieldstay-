import styled from "styled-components";
import { HiOutlinePlus } from "react-icons/hi2";

import Spinner from "../ui/Spinner";
import Empty from "../ui/Empty";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

import { useActivities } from "../features/activities/useActivities";
import ActivityCard from "../features/activities/ActivityCard";
import CreateActivityForm from "../features/activities/CreateActivityForm";

const PageHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.6rem;
  margin-bottom: 2.4rem;

  h1 {
    font-size: 2.8rem;
    font-weight: 700;
    color: var(--color-grey-800);
    margin: 0 0 0.4rem;
  }

  p {
    color: var(--color-grey-500);
    font-size: 1.5rem;
    margin: 0;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.8rem;
`;

const AddButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
`;

function Activities() {
  const { isLoading, activities } = useActivities();

  if (isLoading) return <Spinner />;

  return (
    <Modal>
      <PageHeader>
        <div>
          <h1>活動管理</h1>
          <p>管理活動資訊與報名狀況</p>
        </div>
        <Modal.Open opens="create-activity">
          <AddButton>
            <HiOutlinePlus />
            新增活動
          </AddButton>
        </Modal.Open>
      </PageHeader>

      {!activities?.length ? (
        <Empty resourceName="activities" />
      ) : (
        <Grid>
          {activities.map((activity) => (
            <ActivityCard activity={activity} key={activity.id} />
          ))}
        </Grid>
      )}

      <Modal.Window name="create-activity">
        <CreateActivityForm />
      </Modal.Window>
    </Modal>
  );
}

export default Activities;
