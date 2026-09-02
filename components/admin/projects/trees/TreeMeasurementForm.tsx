"use client";

import { useState } from "react";

import { createTreeMeasurement } from "@/lib/monitorApi";

interface Props {
  projectId: string;

  treeId: string;

  onCreated?: () => void;

  onClose?: () => void;
}

interface FormData {
  measurement_date: string;

  height_cm: string;

  diameter_cm: string;

  health_status: string;

  notes: string;
}

export default function TreeMeasurementForm({
  projectId,

  treeId,

  onCreated,

  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FormData>({
    measurement_date: "",

    height_cm: "",

    diameter_cm: "",

    health_status: "healthy",

    notes: "",
  });

  function updateField(
    key: keyof FormData,

    value: string,
  ) {
    setForm((prev) => ({
      ...prev,

      [key]: value,
    }));
  }

  async function submit() {
    try {
      setLoading(true);

      await createTreeMeasurement(
        projectId,

        treeId,

        {
          measurement_date: form.measurement_date,

          height_cm: Number(form.height_cm),

          diameter_cm: Number(form.diameter_cm),

          health_status: form.health_status,

          notes: form.notes,
        },
      );

      setForm({
        measurement_date: "",

        height_cm: "",

        diameter_cm: "",

        health_status: "healthy",

        notes: "",
      });

      onCreated?.();
    } catch (error) {
      console.error("CREATE MEASUREMENT ERROR:", error);

      alert("Failed save measurement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="
      mt-5
      rounded-2xl
      bg-slate-50
      border
      p-6
      "
    >
      <div
        className="
        flex
        justify-between
        items-center
        mb-5
        "
      >
        <h3
          className="
          text-xl
          font-bold
          text-emerald-950
          "
        >
          Add Measurement
        </h3>

        {onClose && (
          <button
            onClick={onClose}
            className="
              text-slate-500
              "
          >
            ✕
          </button>
        )}
      </div>

      <div
        className="
        grid
        gap-4
        "
      >
        <input
          type="date"
          value={form.measurement_date}
          onChange={(e) =>
            updateField(
              "measurement_date",

              e.target.value,
            )
          }
          className="
          rounded-xl
          border
          p-3
          "
        />

        <input
          type="number"
          placeholder="Height (cm)"
          value={form.height_cm}
          onChange={(e) =>
            updateField(
              "height_cm",

              e.target.value,
            )
          }
          className="
          rounded-xl
          border
          p-3
          "
        />

        <input
          type="number"
          placeholder="Diameter (cm)"
          value={form.diameter_cm}
          onChange={(e) =>
            updateField(
              "diameter_cm",

              e.target.value,
            )
          }
          className="
          rounded-xl
          border
          p-3
          "
        />

        <select
          value={form.health_status}
          onChange={(e) =>
            updateField(
              "health_status",

              e.target.value,
            )
          }
          className="
          rounded-xl
          border
          p-3
          "
        >
          <option value="healthy">Healthy</option>

          <option value="warning">Warning</option>

          <option value="critical">Critical</option>
        </select>

        <textarea
          value={form.notes}
          onChange={(e) =>
            updateField(
              "notes",

              e.target.value,
            )
          }
          placeholder="Notes"
          rows={4}
          className="
          rounded-xl
          border
          p-3
          "
        />

        <button
          disabled={loading}
          onClick={submit}
          className="
          rounded-xl
          bg-emerald-700
          py-3
          font-bold
          text-white
          disabled:opacity-50
          "
        >
          {loading ? "Saving..." : "Save Measurement"}
        </button>
      </div>
    </section>
  );
}
