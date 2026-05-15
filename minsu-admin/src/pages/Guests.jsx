import { useState } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { HiOutlineMagnifyingGlass, HiOutlinePlus } from "react-icons/hi2";

import GuestTable from "../features/guests/GuestTable";
import CreateGuestForm from "../features/guests/CreateGuestForm";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const PageHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.6rem;

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

const AddButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
`;

const ToolBar = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: center;
  padding: 1.6rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;

  & svg {
    position: absolute;
    left: 1.2rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-grey-400);
  }

  & input {
    width: 100%;
    background-color: var(--color-grey-50);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 1rem 1.2rem 1rem 3.6rem;
    font-size: 1.4rem;
    color: var(--color-grey-700);
  }
  & input:focus {
    outline: none;
    border-color: var(--color-brand-600);
  }
`;

function Guests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") || "";

  function handleSearch(e) {
    const value = e.target.value;
    if (value) searchParams.set("q", value);
    else searchParams.delete("q");
    searchParams.delete("page");
    setSearchParams(searchParams);
  }

  return (
    <Modal>
      <Page>
        <PageHeader>
          <div>
            <h1>顧客管理</h1>
            <p>查看和管理所有顧客資料</p>
          </div>
          <Modal.Open opens="create">
            <AddButton>
              <HiOutlinePlus />
              新增顧客
            </AddButton>
          </Modal.Open>
        </PageHeader>

        <ToolBar>
          <SearchBox>
            <HiOutlineMagnifyingGlass />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="搜尋顧客編號、姓名、Email 或電話…"
            />
          </SearchBox>
        </ToolBar>

        <GuestTable search={search} />

        <Modal.Window name="create">
          <CreateGuestForm />
        </Modal.Window>
      </Page>
    </Modal>
  );
}

export default Guests;
