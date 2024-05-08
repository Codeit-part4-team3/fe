import styled from 'styled-components';
import { MessageItem } from '../_types/type';
import extractDate from 'src/utils/extractDate';
import ChatDayDivider from './ChatDayDivider';
import addZero from 'src/utils/addZero';
import { useEffect, useState } from 'react';
import ContextMenu from './ContextMenu';

interface ChatMessagesProps {
  messages: MessageItem[];
  onUpdateMessageClick: ({ messageId, createdAt }: { messageId: string; createdAt: number }) => void;
  onDeleteMessageClick: ({ messageId, createdAt }: { messageId: string; createdAt: number }) => void;
  onUpdateMessageKeyDown: ({ messageId, createdAt }: { messageId: string; createdAt: number }) => void;
  onUpdateMessageCancelClick: ({ messageId }: { messageId: string }) => void;
  editingMessage: string;
  setEditingMessage: React.Dispatch<React.SetStateAction<string>>;
  onEditingMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentEditingMessageId: string | null;
}

interface ContextMenu {
  isOpen: boolean;
  positionX: number;
  positionY: number;
  messageId: string;
  message: string;
  createdAt: number;
}

export default function ChatMessages({
  messages,
  onUpdateMessageClick,
  onDeleteMessageClick,
  onUpdateMessageKeyDown,
  onUpdateMessageCancelClick,
  editingMessage,
  setEditingMessage,
  onEditingMessageChange,
  currentEditingMessageId,
}: ChatMessagesProps) {
  // 마우스 오른쪽 클릭시 메뉴창 뜨게 하기
  const [isContextMenuOpen, setIsContextMenuOpen] = useState<ContextMenu>({
    isOpen: false,
    positionX: 0,
    positionY: 0,
    messageId: '',
    message: '',
    createdAt: 0,
  });

  // message에 대고 우클릭하면 ContextMenu가 열리게 하기
  const handleContextMenuOpen =
    (messageId: string, message: string, createdAt: number) => (e: React.MouseEvent<HTMLDivElement>) => {
      console.log('right click');
      e.preventDefault();
      setIsContextMenuOpen(() => {
        return {
          isOpen: !isContextMenuOpen.isOpen,
          positionX: e.clientX,
          positionY: e.clientY,
          messageId,
          message,
          createdAt,
        };
      });
      setEditingMessage(message);
    };

  // ContextMenu가 열려있을 때만 handleContextMenuClose 이벤트리스너 추가
  useEffect(() => {
    const handleContextMenuClose = () => {
      setIsContextMenuOpen({
        isOpen: false,
        positionX: 0,
        positionY: 0,
        messageId: '',
        message: '',
        createdAt: 0,
      });
    };

    if (isContextMenuOpen.isOpen) {
      document.addEventListener('click', handleContextMenuClose);
    } else {
      document.removeEventListener('click', handleContextMenuClose);
    }

    // 메모리 누수 방지를 위해 이벤트리스너 제거
    return () => {
      document.removeEventListener('click', handleContextMenuClose);
    };
  }, [isContextMenuOpen]);

  // 다음 메시지의 유저와 현재 메시지의 유저가 다르면 true로 변경
  let isDifferentUser = false;

  if (!messages || messages.length === 0) return null;
  return (
    <>
      {isContextMenuOpen.isOpen ? (
        <ContextMenu
          {...isContextMenuOpen}
          onUpdateMessageClick={onUpdateMessageClick}
          onDeleteMessageClick={onDeleteMessageClick}
        />
      ) : null}
      {messages.map((messageItem, index) => {
        // 다음 메시지의 유저와 현재 메시지의 유저가 다르면 true로 변경
        isDifferentUser = messages[index + 1]?.userId !== messageItem.userId;

        // createdAt에서 날짜 데이터 추출
        const { year, month, day, hour, minute } = extractDate(messageItem.createdAt);
        //2024.04.22. 오후 09:31 형태
        const messageCreatedAt = `${year}.${addZero(month)}.${addZero(day)}. ${hour >= 12 ? '오후' : '오전'} ${hour % 12}:${addZero(minute)}`;

        // 다음 날짜와 현재 날짜가 다르다면 ChatDayDivider를 보여준다
        const { day: nextDay } = extractDate(messages[index + 1]?.createdAt);
        const isDifferentDay = nextDay !== day;
        // 다음 날짜와 현재 날짜가 다르면 isDifferentUser를 true로 변경해서 사용자 프로필 이미지를 보여준다
        if (isDifferentDay) {
          isDifferentUser = true;
        }

        // 2024년 04월 22일 (화) 헝태
        const ChatDayDividerDay = `${year}년 ${addZero(month)}월 ${addZero(day)}일 (${'일월화수목금토'[new Date(`${year}-${month}-${day}`).getDay()]})`;
        return (
          <>
            {isDifferentUser ? (
              <>
                <ChatMessageWrapper
                  key={messageItem.messageId}
                  onContextMenu={handleContextMenuOpen(
                    messageItem.messageId,
                    messageItem.message,
                    messageItem.createdAt,
                  )}
                  isOnEdit={currentEditingMessageId === messageItem.messageId}
                >
                  <UserProfileImage>
                    <Image />
                  </UserProfileImage>

                  <ChatMessageContent>
                    <ChatMessageContentHeader>
                      <ChatMessageSender>{messageItem.userId}</ChatMessageSender>
                      <ChatMessageCreatedAt>{messageCreatedAt}</ChatMessageCreatedAt>
                    </ChatMessageContentHeader>
                    {messageItem.status === 'editing' ? (
                      <ChatMessageTextEditingBox>
                        <ChatMessageTextEditingInput value={editingMessage} onChange={onEditingMessageChange} />
                        <ChatMessageTextEditingDescription>
                          ESC 키로
                          <button
                            onClick={() => {
                              onUpdateMessageCancelClick({ messageId: messageItem.messageId });
                            }}
                          >
                            취소
                          </button>
                          • Enter 키로
                          <button
                            onClick={() => {
                              onUpdateMessageKeyDown({
                                messageId: messageItem.messageId,
                                createdAt: messageItem.createdAt,
                              });
                            }}
                          >
                            저장
                          </button>
                        </ChatMessageTextEditingDescription>
                      </ChatMessageTextEditingBox>
                    ) : (
                      <ChatMessageText>{messageItem.message}</ChatMessageText>
                    )}
                  </ChatMessageContent>
                </ChatMessageWrapper>
              </>
            ) : (
              <>
                {messageItem.status === 'editing' ? (
                  <SameUserMessage isOnEdit={currentEditingMessageId === messageItem.messageId}>
                    <ChatMessageTextEditingBox>
                      <ChatMessageTextEditingInput value={editingMessage} onChange={onEditingMessageChange} />
                      <ChatMessageTextEditingDescription>
                        ESC 키로
                        <button
                          onClick={() => {
                            onUpdateMessageCancelClick({ messageId: messageItem.messageId });
                          }}
                        >
                          취소
                        </button>
                        • Enter 키로
                        <button
                          onClick={() => {
                            onUpdateMessageKeyDown({
                              messageId: messageItem.messageId,
                              createdAt: messageItem.createdAt,
                            });
                          }}
                        >
                          저장
                        </button>
                      </ChatMessageTextEditingDescription>
                    </ChatMessageTextEditingBox>
                  </SameUserMessage>
                ) : (
                  <SameUserMessage
                    key={messageItem.messageId}
                    onContextMenu={handleContextMenuOpen(
                      messageItem.messageId,
                      messageItem.message,
                      messageItem.createdAt,
                    )}
                    isOnEdit={currentEditingMessageId === messageItem.messageId}
                  >
                    <ChatMessageText>{messageItem.message}</ChatMessageText>
                  </SameUserMessage>
                )}
              </>
            )}
            {isDifferentDay ? <ChatDayDivider ChatDayDividerDay={ChatDayDividerDay} /> : null}
          </>
        );
      })}
    </>
  );
}

const ChatMessageWrapper = styled.div<{ isOnEdit: boolean }>`
  width: 100%;
  display: flex;
  gap: 12px;

  margin-top: 20px;
  padding-left: 20px;
  padding-right: 20px;

  background-color: ${({ isOnEdit }) => (isOnEdit ? 'var(--gray_CCCCCC)' : 'transparent')};

  &:hover {
    background-color: var(--gray_CCCCCC);
  }
`;

const UserProfileImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;

  background-size: cover;
  background-image: url('/images/minji-profile-image.png');

  &:hover {
    cursor: pointer;
  }
`;

const ChatMessageContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ChatMessageContentHeader = styled.div`
  display: flex;
  gap: 8px;
`;

const ChatMessageSender = styled.div`
  color: var(--black_000000);
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 700;
  line-height: 160%; /* 25.6px */
`;

const ChatMessageCreatedAt = styled.div`
  color: var(--gray_666666);
  font-family: Pretendard;
  font-size: 10px;
  line-height: 160%; /* 16px */

  display: flex;
  align-items: center;
`;

const ChatMessageText = styled.p`
  color: var(--black_000000);
  font-family: Pretendard;
  font-size: 16px;
  line-height: 160%; /* 25.6px */
  margin: 0;
`;

const SameUserMessage = styled.div<{ isOnEdit: boolean }>`
  display: flex;
  padding-left: 72px;
  background-color: ${({ isOnEdit }) => (isOnEdit ? 'var(--gray_CCCCCC)' : 'transparent')};

  &:hover {
    background-color: var(--gray_CCCCCC);
  }
`;

const ChatMessageTextEditingBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-right: 52px;

  margin-top: 6px;
`;

const ChatMessageTextEditingInput = styled.input`
  width: 100%;
  border: none;
  border-radius: 8px;
  font-family: pretendard;
  font-size: 16px;
  outline: none;
  padding: 12px 18px;

  background-color: var(--gray_EEEEEE);
`;

const ChatMessageTextEditingDescription = styled.div`
  font-family: Pretendard;
  font-size: 12px;
  padding-bottom: 6px;
  button {
    background-color: transparent;
    border: none;
    color: var(--blue_5534DA);
    font-weight: 700;
    cursor: pointer;
  }
`;
