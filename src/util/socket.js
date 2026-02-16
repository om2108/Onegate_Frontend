import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let client = null;

export const connectSocket = (userId, onRefresh) => {
  if (!userId) return;

  client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
    reconnectDelay: 5000,

    onConnect: () => {

      client.subscribe(`/topic/notifications/${userId}`, () => {

        if (onRefresh) onRefresh();
      });
    },

  });

  client.activate();
};

export const disconnectSocket = () => {
  if (client) client.deactivate();
};
