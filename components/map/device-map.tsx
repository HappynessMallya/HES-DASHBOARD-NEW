"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import type { DeviceLocation, DCULocation } from "@/lib/types";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

// Tanzania center coordinates
const TANZANIA_CENTER: [number, number] = [-6.369, 34.889];
const DEFAULT_ZOOM = 6;

const meterOnlineIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:12px;height:12px;border-radius:50%;background:#16a34a;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const meterOfflineIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:12px;height:12px;border-radius:50%;background:#dc2626;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const dcuIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:4px;background:#0ea5e9;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><div style="width:6px;height:6px;background:white;border-radius:50%"></div></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface DeviceMapProps {
  meters: DeviceLocation[];
  dcus: DCULocation[];
  showMeters: boolean;
  showDCUs: boolean;
  showConnections: boolean;
}

export default function DeviceMap({
  meters,
  dcus,
  showMeters,
  showDCUs,
  showConnections,
}: DeviceMapProps) {
  const dcuMap = new Map(dcus.map((d) => [d.id, d]));

  return (
    <MapContainer
      center={TANZANIA_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full rounded-lg"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* DCU Markers */}
      {showDCUs &&
        dcus.map((dcu) => (
          <Marker
            key={`dcu-${dcu.id}`}
            position={[dcu.latitude, dcu.longitude]}
            icon={dcuIcon}
          >
            <Popup>
              <div className="min-w-48">
                <p className="font-bold text-[#14532d]">{dcu.name}</p>
                <p className="text-sm text-[#6b7280]">Data Concentrator</p>
                <div className="mt-1 text-sm">
                  <p>
                    Status:{" "}
                    <span
                      className={
                        dcu.status === "online"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {dcu.status}
                    </span>
                  </p>
                  <p>Connected meters: {dcu.connected_meters}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Meter Markers */}
      {showMeters &&
        meters.map((meter) => (
          <Marker
            key={`meter-${meter.id}`}
            position={[meter.latitude, meter.longitude]}
            icon={meter.is_online ? meterOnlineIcon : meterOfflineIcon}
          >
            <Popup>
              <div className="min-w-48">
                <p className="font-bold font-mono text-[#14532d]">
                  {meter.serial_number}
                </p>
                <p className="text-sm">
                  Status:{" "}
                  <span
                    className={
                      meter.is_online ? "text-green-600" : "text-red-600"
                    }
                  >
                    {meter.is_online ? "Online" : "Offline"}
                  </span>
                </p>
                {meter.group_name && (
                  <p className="text-sm text-[#6b7280]">
                    Group: {meter.group_name}
                  </p>
                )}
                <Link
                  href={`/meters/${meter.id}`}
                  className="mt-1 inline-block text-sm text-[#16a34a] hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Connections: DCU to meters */}
      {showConnections &&
        meters
          .filter((m) => m.dcu_id)
          .map((meter) => {
            const dcu = dcuMap.get(meter.dcu_id!);
            if (!dcu) return null;
            return (
              <Polyline
                key={`line-${meter.id}`}
                positions={[
                  [dcu.latitude, dcu.longitude],
                  [meter.latitude, meter.longitude],
                ]}
                color="#bbf7d0"
                weight={1}
                opacity={0.6}
              />
            );
          })}
    </MapContainer>
  );
}
