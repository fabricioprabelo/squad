import { gql, useSubscription } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import useAuth from '../hooks/auth';
import Message from '../models/Subscription';
import DateTime from '../support/DateTime';

interface IMessagesSubscription {
  subscriptionMessage: Message
}

interface IMessagesQuery {
  unreadSubscriptionMessages: Message[]
}

const UNREAD_MESSAGES = gql`
  query unreadSubscriptionMessages {
    unreadSubscriptionMessages {
      id
      createdAt
      updatedAt
      title
      image
      message
      isRead
      user {
        id
        name
        surname
      }
    }
  }
`;

const MESSAGES_SUBSCRIPTION = gql`
  subscription subscriptionMessage {
    subscriptionMessage {
      id
      createdAt
      updatedAt
      title
      image
      message
      isRead
      user {
        id
        name
        surname
      }
    }
  }
`;

export default function NotificationsNav() {
  const { user, client, apolloError } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageCount, setMessageCount] = useState<number>(0);
  const { data, error, loading } = useSubscription<IMessagesSubscription>(MESSAGES_SUBSCRIPTION);

  const toggle = () => setDropdownOpen(prevState => !prevState);

  const handleReadMessages = async () => {
    await client.mutate({
      mutation: gql`
          mutation markAsReadSubscriptionMessages($ids: [String!]!) {
            markAsReadSubscriptionMessages(ids: $ids)
          }
        `,
      variables: {
        ids: messages.map(message => message.id)
      }
    })
      .then(res => {
        setMessageCount(0);
      })
      .catch(err => apolloError(err));
  };

  const handleData = useCallback(async () => {
    await client.query<IMessagesQuery>({
      query: UNREAD_MESSAGES
    })
      .then(res => {
        res.data.unreadSubscriptionMessages?.forEach(message => {
          if (!messages.map(msg => msg.id).includes(message.id)) {
            const msgs = [...messages, message];
            setMessages(msgs);
            setMessageCount(msgs.length);
          }
        });
      })
      .catch(err => apolloError(err));
  }, [client, apolloError, messages]);

  useEffect(() => {
    handleData();
  }, [handleData])

  useEffect(() => {
    if (error) console.log(error);
    if (data) {
      if (user && !messages.map(msg => msg.id).includes(data.subscriptionMessage.id) && data.subscriptionMessage.user?.id === user.id) {
        const msgs = [...messages, data.subscriptionMessage];
        setMessages(msgs);
        setMessageCount(msgs.length);
      }
    };
  }, [error, loading, data, messages, user])

  return (
    <>
      <Dropdown
        isOpen={dropdownOpen}
        toggle={toggle}
        className="no-arrow mx-1"
        nav
      >
        <DropdownToggle
          tag={Link}
          to="#javascript"
          className="nav-link dropdown-toggle"
          id="alertsDropdown"
          role="button"
          data-toggle="dropdown"
          aria-expanded={false}
          aria-haspopup
          onClick={handleReadMessages}
        >
          <i className="fas fa-bell fa-fw"></i>
          {messageCount ? <span className="badge badge-danger badge-counter">{messageCount}</span> : ""}
        </DropdownToggle>
        <DropdownMenu
          className="dropdown-list dropdown-menu-right shadow animated--grow-in"
          aria-labelledby="alertsDropdown"
        >
          <DropdownItem header>Central de Notificações</DropdownItem>
          {!messages.length ? (
            <DropdownItem className="d-flex align-items-center">
              <div className="small text-gray-500">Não há nenhuma notificação ainda.</div>
            </DropdownItem>
          ) : (
            <>
              {messages?.map((message, index) => (
                <DropdownItem
                  key={`message-${index}`}
                  className="d-flex align-items-center"
                >
                  <div>
                    <div className="small text-gray-500">{DateTime.now(message.createdAt).format("LLL")}</div>
                    {message.message}
                  </div>
                </DropdownItem>
              ))}
            </>
          )}
        </DropdownMenu>
      </Dropdown>
    </>
  );
}
