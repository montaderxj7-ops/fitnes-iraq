"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getChats() {
  try {
    let chats = await prisma.chat.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return chats;
  } catch (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
}

export async function getMessages(chatId: string) {
  try {
    let messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });
    
    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

export async function sendMessage(chatId: string, content: string) {
  try {
    const newMessage = await prisma.message.create({
      data: {
        chatId,
        sender: "coach",
        content,
      }
    });
    
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        lastMessage: content,
        time: "الآن"
      }
    });
    
    revalidatePath("/dashboard/inbox");
    return { success: true, message: newMessage };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

// Client Side Actions
export async function getOrCreateClientChat(clientId: string, clientName: string) {
  try {
    let chat = await prisma.chat.findUnique({
      where: { id: clientId }
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          id: clientId,
          clientName: clientName,
          lastMessage: "بدأت المحادثة",
          time: "الآن"
        }
      });
    }

    return { success: true, chat };
  } catch (error) {
    console.error("Error setting up chat:", error);
    return { success: false, error: "Failed to set up chat" };
  }
}

export async function sendClientMessage(clientId: string, content: string) {
  try {
    // Ensure chat exists
    let chat = await prisma.chat.findUnique({ where: { id: clientId } });
    if (!chat) {
      return { success: false, error: "Chat not found" };
    }

    const newMessage = await prisma.message.create({
      data: {
        chatId: clientId,
        sender: "client",
        content,
      }
    });
    
    await prisma.chat.update({
      where: { id: clientId },
      data: {
        lastMessage: content,
        time: "الآن",
        unread: { increment: 1 }
      }
    });
    
    revalidatePath("/dashboard/inbox");
    return { success: true, message: newMessage };
  } catch (error) {
    console.error("Error sending client message:", error);
    return { success: false, error: "Failed to send message" };
  }
}
