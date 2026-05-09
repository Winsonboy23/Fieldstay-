import UpdatePasswordForm from "../features/authentication/UpdatePasswordForm";
import UpdateUserDataForm from "../features/authentication/UpdateUserDataForm";
import Uploader from "../data/Uploader";
import Heading from "../ui/Heading";
import Row from "../ui/Row";

function Account() {
  return (
    <>
      <Heading as="h1">帳號設定</Heading>

      <Row>
        <Heading as="h3">更新使用者資料</Heading>
        <UpdateUserDataForm />
      </Row>

      <Row>
        <Heading as="h3">更新密碼</Heading>
        <UpdatePasswordForm />
      </Row>
      <Uploader />
    </>
  );
}

export default Account;
