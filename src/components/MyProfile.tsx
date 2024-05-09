import styled from 'styled-components';
import { UserIdContext } from '../pages/server/Server';
import { useContext, useState } from 'react';
import MyDropDown from './dropdown/MyDropDown';
import InvitedServerListModal from './modal/contents/InvitedServerListModal';
import { MyDropdownType } from 'src/constants/enum';

/**
 * get user profile image, status, and user id
 */
export default function MyProfile() {
  const [isShow, setIsShow] = useState<boolean>(false);
  const [isDropdown, setIsDropdown] = useState<boolean>(false);
  const [dropdownType, setDropdownType] = useState<MyDropdownType>(MyDropdownType.INVITED_SERVER_LIST);
  const user = useContext<number>(UserIdContext);

  const handleCloseModal = () => {
    setIsShow(false);
    setIsDropdown(false);
  };

  const toggleDropdown = () => {
    setIsDropdown(!isDropdown);
  };

  const handleSelectItem = (item: MyDropdownType) => {
    setIsShow(true);
    setDropdownType(item);
  };

  return (
    <>
      <Area>
        <Wrapper>
          <ImageWrapper>
            <ProfileImage onClick={toggleDropdown} />
          </ImageWrapper>
          <InfoWrapper>
            <strong>{user}</strong>
            <div>
              <Status />
              <div>온라인</div>
            </div>
          </InfoWrapper>
          <MyDropDown isDropDown={isDropdown} selectItem={handleSelectItem} />
        </Wrapper>
      </Area>
      {
        {
          [MyDropdownType.INVITED_SERVER_LIST]: (
            <InvitedServerListModal closeModal={handleCloseModal} isOpen={isShow} />
          ),
        }[dropdownType]
      }
    </>
  );
}

const Area = styled.div`
  width: 100%;
  height: 60px;

  /* padding-left: 10px; */
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);

  position: relative;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
`;

const ImageWrapper = styled.div`
  width: 42px;
  height: 42px;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  overflow: hidden;

  margin-left: 10px;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;

  border-radius: 50%;
  overflow: hidden;
  background-size: cover;
  background-image: url('/images/minji-profile-image.png');

  &:hover {
    cursor: pointer;
  }
`;

const InfoWrapper = styled.div`
  width: 120px;
  height: 60px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 5px;

  & > div {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
  }
`;

const Status = styled.div`
  width: 10px;
  height: 10px;
  background-color: #00cc00;
  border-radius: 50%;
`;