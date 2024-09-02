require("dotenv").config();
const { HUGGING_APIKEY } = process.env;
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(HUGGING_APIKEY);

export async function POST(req) {
  try {
    // Extraer el asiento del cuerpo de la solicitud
    const { asiento } = await req.json(); // Asegúrate de usar req.json() para extraer el JSON del body
    console.log(asiento, "ASIENTO");

    // Crear el prompt dinámicamente con el asiento recibido
    const prompt = `
### Cuentas Disponibles:
- **Activo**:
  - Caja
  - Banco c/c
  - Mercaderías
  - Muebles y Útiles
  - Rodados
  - Maquinarias
  - Inmuebles
  - Instalaciones
  - Valores a Depositar
  - Depósito a Plazo Fijo
  - Títulos y Bonos
  - Acciones de otras sociedades
  - Deudores por Ventas
  - Documentos a Cobrar
  - Alquileres a Cobrar
  - IVA Crédito Fiscal
  - Anticipo de Sueldos
  - Productos en Proceso
  - Productos Terminados
  - Marcas y Patentes
  - Derechos de Autor
  - Llave de Negocio
  - Gastos de Organización

- **Pasivo**:
  - Proveedores
  - Documentos a Pagar
  - Préstamos Bancarios
  - Cargas Sociales a Pagar

- **Patrimonio Neto**:
  - Capital
  - Resultados No Asignados
  - Reserva Legal

- **Ingresos**:
  - Ventas
  - Alquileres Cobrados
  - Intereses Ganados

- **Egresos**:
  - Alquileres Pagados
  - Intereses Pagados
  - Gastos Generales
  - Fletes

Al crear un libro diario con el siguiente asiento: "${asiento}". ¿Qué cuentas se debitan y cuáles se acreditan?

Que la respuesta sea una lista con la siguiente forma:
debito: que se utiliza
credito: que se utiliza
asiento: descripción del asiento
    `;

    // Llamada a la API de Hugging Face
    const result = await hf.chatCompletion({
      model: "mistralai/Mistral-Nemo-Instruct-2407",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.1,
      seed: 0,
    });

    const response = result.choices[0].message.content;
    console.log(response, "RESULT");

    // Procesar la respuesta para extraer los detalles
    const details = {
      asiento: "",
      debito: "",
      credito: "",
      explicacion: "",
    };

    // Convertir el texto en un array de líneas
    const lines = response.split("\n").map((line) => line.trim());

    // Buscar cada sección en el texto
    lines.forEach((line) => {
      if (line.toLowerCase().startsWith("asiento:")) {
        details.asiento = line.slice("asiento:".length).trim();
      } else if (line.toLowerCase().startsWith("debito:")) {
        details.debito = line.slice("debito:".length).trim();
      } else if (line.toLowerCase().startsWith("credito:")) {
        details.credito = line.slice("credito:".length).trim();
      } else if (line.toLowerCase().startsWith("explicación:")) {
        details.explicacion = line.slice("explicación:".length).trim();
      }
    });

    // Responder con los detalles extraídos
    return new Response(JSON.stringify(details), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Error generating the journal entry" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
