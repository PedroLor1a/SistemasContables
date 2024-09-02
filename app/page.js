"use client";
import { useState } from "react";

export default function Home() {
  const [asiento, setAsiento] = useState("");
  const [journalEntry, setJournalEntry] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault(); // Evita el envío predeterminado del formulario
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ asiento }), // Envía el asiento del formulario en el cuerpo de la solicitud
      });

      if (!response.ok) {
        throw new Error("Error fetching journal entry");
      }

      const data = await response.json();
      console.log(data, "RESPONSE");

      const entryLines = [
        {
          descripcion: data.asiento,
          debitar: data.debito,
          acreditar: data.credito,
        },
      ];

      setJournalEntry(entryLines);
    } catch (error) {
      console.error("Error generating journal entry:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 font-sans">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="asiento"
            className="block text-sm font-medium text-gray-700">
            Asiento Contable
          </label>
          <input
            type="text"
            id="asiento"
            name="asiento"
            value={asiento}
            onChange={(e) => setAsiento(e.target.value)} // Actualiza el estado con el valor del formulario
            className="mt-1 block w-full p-2 border border-gray-300 rounded text-black"
            placeholder="Ej: Se pagan impuestos en efectivo"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 mb-6 text-white rounded ${
            loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-700"
          }`}>
          {loading ? "Generando..." : "Generar Asiento"}
        </button>
      </form>

      {journalEntry && (
        <div className="border border-gray-300 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Asiento Contable:</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border border-gray-300 text-left text-black">
                  Asiento
                </th>
                <th className="p-2 border border-gray-300 text-left text-black">
                  Debe
                </th>
                <th className="p-2 border border-gray-300 text-left text-black">
                  Haber
                </th>
              </tr>
            </thead>
            <tbody>
              {journalEntry.map((entry, index) => (
                <tr key={index}>
                  <td className="p-2 border border-gray-300">
                    {entry.descripcion}
                  </td>
                  <td className="p-2 border border-gray-300">
                    {entry.debitar}
                  </td>
                  <td className="p-2 border border-gray-300">
                    {entry.acreditar}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
