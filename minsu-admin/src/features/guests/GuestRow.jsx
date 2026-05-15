import styled from "styled-components";
import {
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";

import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Modal from "../../ui/Modal";

import EditGuestForm from "./EditGuestForm";
import GuestDetailModal from "./GuestDetailModal";
import { useDeleteGuest } from "./useDeleteGuest";

const GuestCode = styled.span`
  font-family: "Noto Sans TC", sans-serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-grey-700);
`;

const Name = styled.div`
  font-weight: 500;
  color: var(--color-grey-700);
  white-space: nowrap;
`;

const Text = styled.div`
  color: var(--color-grey-700);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.4rem;
  height: 2.4rem;
  padding: 0 0.8rem;
  border-radius: 999px;
  background-color: var(--color-grey-50);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-grey-700);
`;

function guestCode(id) {
  return `CUS${String(id || "").replace(/\D/g, "").padStart(3, "0")}`;
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).slice(0, 10).replaceAll("/", "-");
}

function GuestRow({ guest }) {
  const { deleteGuest, isDeleting } = useDeleteGuest();

  function handleDelete() {
    if (!window.confirm(`確定刪除顧客「${guest.fullName}」？`)) return;
    deleteGuest(guest.id);
  }

  return (
    <Table.Row>
      <GuestCode>{guestCode(guest.id)}</GuestCode>
      <Name>{guest.fullName}</Name>
      <Text>{guest.email}</Text>
      <Text>{guest.phone || "—"}</Text>
      <Text>{formatDate(guest.created_at)}</Text>
      <div><Pill>{guest.bookingsCount ?? 0}</Pill></div>
      <div><Pill>0</Pill></div>

      <Modal>
        <Menus.Menu>
          <Menus.Toggle id={guest.id} />
          <Menus.List id={guest.id}>
            <Modal.Open opens="detail">
              <Menus.Button icon={<HiOutlineEye />}>查看詳情</Menus.Button>
            </Modal.Open>
            <Modal.Open opens="edit">
              <Menus.Button icon={<HiOutlinePencilSquare />}>編輯資料</Menus.Button>
            </Modal.Open>
            <Menus.Button
              icon={<HiOutlineTrash />}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              刪除顧客
            </Menus.Button>
          </Menus.List>
        </Menus.Menu>

        <Modal.Window name="detail">
          <GuestDetailModal guest={guest} />
        </Modal.Window>

        <Modal.Window name="edit">
          <EditGuestForm guestToEdit={guest} />
        </Modal.Window>
      </Modal>
    </Table.Row>
  );
}

export default GuestRow;
