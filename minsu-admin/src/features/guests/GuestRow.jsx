import styled from "styled-components";
import { HiPencilSquare } from "react-icons/hi2";

import Table from "../../ui/Table";
import Modal from "../../ui/Modal";
import Menus from "../../ui/Menus";
import EditGuestForm from "./EditGuestForm";

const Name = styled.div`
  font-weight: 600;
  color: var(--color-grey-700);
`;

const Text = styled.div`
  color: var(--color-grey-600);
`;

function GuestRow({ guest }) {
  const { id, fullName, email, occupation } = guest;

  return (
    <Table.Row>
      <Name>{fullName}</Name>
      <Text>{email}</Text>
      <Text>{occupation || "-"}</Text>

      <Modal>
        <Menus.Menu>
          <Menus.Toggle id={id} />
          <Menus.List id={id}>
            <Modal.Open opens="edit">
              <Menus.Button icon={<HiPencilSquare />}>編輯</Menus.Button>
            </Modal.Open>
          </Menus.List>
        </Menus.Menu>

        <Modal.Window name="edit">
          <EditGuestForm guestToEdit={guest} />
        </Modal.Window>
      </Modal>
    </Table.Row>
  );
}

export default GuestRow;
