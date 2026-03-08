"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "@/lib/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from "next/navigation";
import { latinize } from "@/lib/latinize";


type MapProps = {
    cities?: any[];
    isStatic?: boolean;

};

export default function Map({ cities = [], isStatic = false }: MapProps) {


    const mapContainer = useRef<HTMLDivElement>(null);
    const popupRef = useRef<mapboxgl.Popup | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const router = useRouter();
    const citiesRef = useRef<any[]>([]);
    useEffect(() => {
        citiesRef.current = cities;
    }, [cities]);




    useEffect(() => {

        if (mapRef.current) return;
        if (!mapContainer.current) return;

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/light-v11",
            projection: "globe",
            center: [10, 50],
            zoom: 4,
            interactive: !isStatic,
        });

        mapRef.current = map;

        map.on("load", () => {
            let hoveredCityId: number | null = null;

            map.setFog({
                color: "#000000",      // atmosfer rengi
                "high-color": "#000000",
                "horizon-blend": 0.02,
                "space-color": "#000000",   // ⭐ Dünyanın arka tarafı
                "star-intensity": 0.6
            });

            // ana water layer
            map.setPaintProperty("water", "fill-color", "#3b82f6");

            // bazı style’larda farklı layer isimleri olabilir
            if (map.getLayer("water-shadow")) {
                map.setPaintProperty("water-shadow", "fill-color", "#0ea5e9");
            }

            map.getStyle().layers?.forEach((layer) => {
                if (layer.type === "symbol") {
                    const id = layer.id;

                    // şehir / bölge / mahalle yazılarını kapat
                    if (
                        id.includes("settlement") ||
                        id.includes("place") ||
                        id.includes("town") ||
                        id.includes("village") ||
                        id.includes("region")
                    ) {
                        map.setLayoutProperty(id, "visibility", "none");
                    }
                }
            });

            map.getStyle().layers?.forEach((layer) => {
                if (layer.type === "symbol") {
                    const id = layer.id;

                    if (id.includes("country-label")) {
                        map.setLayoutProperty(id, "visibility", "visible");
                    }
                }
            });

            popupRef.current = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: "city-tooltip",
                offset: 15
            });

            map.addSource("nuts", {
                type: "geojson",
                data: "/eu-cities/europe.geojson",
                generateId: true
            });
            map.addSource("bosnia", {
                type: "geojson",
                data: "/eu-cities/bosnia.json",
                generateId: true
            });

            map.addSource("kosovo", {
                type: "geojson",
                data: "/eu-cities/kosovo.json",
                generateId: true
            });

            // BALKAN + TR LEVEL 3
            const nuts2Countries = ["DE", "UK"];

            const cityFilter = [
                "any",

                // 🇩🇪 🇬🇧 → NUTS 2
                [
                    "all",
                    ["in", ["get", "CNTR_CODE"], ["literal", nuts2Countries]],
                    ["==", ["get", "LEVL_CODE"], 2]
                ],

                // 🌍 diğer ülkeler → NUTS 3
                [
                    "all",
                    ["!", ["in", ["get", "CNTR_CODE"], ["literal", nuts2Countries]]],
                    ["==", ["get", "LEVL_CODE"], 3]
                ]
            ] as any;

            // 🌍 COUNTRY FILL
            map.addLayer({
                id: "country-fill",
                type: "fill",
                source: "nuts",
                filter: ["==", ["get", "LEVL_CODE"], 0],
                paint: {
                    "fill-color": "#e5e7eb",
                    "fill-opacity": 0.2
                }
            });

            // 🏙 CITY FILL (RENKLER)
            map.addLayer({
                id: "city-fill",
                type: "fill",
                source: "nuts",
                filter: cityFilter,
                paint: {
                    "fill-color": [
                        "match",
                        ["slice", ["get", "NUTS_ID"], 0, 2],

                        "TR", "#dc2626", // Kırmızı
                        "EL", "#06b6d4",
                        "BG", "#16a34a", // Yeşil
                        "RO", "#facc15", // Altın
                        "HU", "#6b8e23", // Zeytin
                        "AT", "#7f1d1d", // Bordo
                        "SK", "#0ea5e9", // Gök mavi
                        "CZ", "#1e40af", // Koyu mavi
                        "PL", "#dc2626",
                        "DE", "#7c3aed", // Mor
                        "FR", "#2563eb", // Mavi
                        "ES", "#f97316", // Turuncu
                        "PT", "#166534", // Koyu yeşil
                        "IT", "#84cc16", // Fıstık yeşili
                        "CH", "#b91c1c", // Al kırmızı
                        "BE", "#f59e0b", // Kehribar
                        "NL", "#ff7a00", // Parlak turuncu
                        "LU", "#7dd3fc", // Bebek mavi
                        "UK", "#ec4899", // Pembe
                        "IE", "#059669", // Zümrüt
                        "DK", "#be123c", // Gül kurusu
                        "NO", "#991b1b", // Kan kırmızı
                        "SE", "#fde047", // Sarı
                        "FI", "#166534", // Orman yeşili
                        "EE", "#0f52ba", // Safir
                        "LV", "#7f1d1d", // Vişne çürüğü
                        "LT", "#d4a017", // Hardal
                        "SI", "#a855f7", // Eflatun
                        "HR", "#724916", // Lavanta
                        "RS", "#6b21a8", // Patlıcan moru
                        "BA", "#0284c7", // Deniz mavisi
                        "ME", "#f59e0b", // Bal rengi
                        "XK", "#1e3a8a", // Kosova Çivit
                        "MK", "#fb7185", // Mercan
                        "AL", "#b45309", // Kiremit
                        "CY", "#b45309", // Bakır

                        "#e5e7eb" // diğer ülkeler açık gri
                    ],
                    "fill-opacity": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        0.9,
                        0.6
                    ]
                }
            });

            map.addLayer({
                id: "bosnia-fill",
                type: "fill",
                source: "bosnia",
                paint: {
                    "fill-color": "#6ee7b7",
                    "fill-opacity": 0.6
                }
            });

            map.addLayer({
                id: "kosovo-fill",
                type: "fill",
                source: "kosovo",
                paint: {
                    "fill-color": "#fde68a",
                    "fill-opacity": 0.6
                }
            });

            map.addLayer({
                id: "bosnia-outline",
                type: "line",
                source: "bosnia",
                paint: {
                    "line-color": "#ffffff",
                    "line-width": 0.5
                }
            });

            map.addLayer({
                id: "kosovo-outline",
                type: "line",
                source: "kosovo",
                paint: {
                    "line-color": "#ffffff",
                    "line-width": 0.5
                }
            });

            // 🧱 CITY BORDER
            map.addLayer({
                id: "city-outline",
                type: "line",
                source: "nuts",
                filter: cityFilter,
                paint: {
                    "line-color": "#ffffff",
                    "line-width": 0.5
                }
            });

            // ✨ HOVER BORDER
            map.addLayer({
                id: "city-hover",
                type: "line",
                source: "nuts",
                filter: cityFilter,
                paint: {
                    "line-color": "#000",
                    "line-width": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        3,
                        0
                    ]
                }
            });
            map.on("mousemove", "bosnia-fill", (e) => {
                if (!e.features?.length) return;

                const name =
                    e.features[0].properties?.NAME_1 ||
                    e.features[0].properties?.NAME_LATN ||
                    e.features[0].properties?.name;

                if (name && popupRef.current) {
                    popupRef.current
                        .setLngLat(e.lngLat)
                        .setHTML(`<strong>${name}</strong>`)
                        .addTo(map);
                }

                map.getCanvas().style.cursor = "pointer";
            });

            map.on("mousemove", "kosovo-fill", (e) => {
                if (!e.features?.length) return;

                const name =
                    e.features[0].properties?.NAME_1 ||
                    e.features[0].properties?.NAME_LATN ||
                    e.features[0].properties?.name;

                if (name && popupRef.current) {
                    popupRef.current
                        .setLngLat(e.lngLat)
                        .setHTML(`<strong>${name}</strong>`)
                        .addTo(map);
                }

                map.getCanvas().style.cursor = "pointer";
            });

            // 🖱 HOVER
            map.on("mousemove", "city-fill", (e) => {
                if (!e.features?.length) return;
                const id = e.features[0].id as number;

                if (hoveredCityId !== null) {
                    map.setFeatureState({ source: "nuts", id: hoveredCityId }, { hover: false });
                }

                hoveredCityId = id;
                map.setFeatureState({ source: "nuts", id }, { hover: true });

                const nutsId = e.features[0].properties?.NUTS_ID;
                const rawName =
                    e.features[0].properties?.NAME_LATN ||
                    e.features[0].properties?.NUTS_NAME;

                if (!nutsId) return;

                const city = citiesRef.current.find(
                    (c) =>
                        latinize(c.name).toLowerCase().replace(/-/g, " ") ===
                        latinize(rawName).toLowerCase().replace(/-/g, " ")
                );

                const displayName = city
                    ? `<strong>${latinize(city.name)}</strong>`
                    : `<strong>${latinize(rawName)}</strong>`;
                if (displayName && popupRef.current) {
                    popupRef.current
                        .setLngLat(e.lngLat)
                        .setHTML(displayName)
                        .addTo(map);
                }

                map.getCanvas().style.cursor = "pointer";
            });

            map.on("click", "city-fill", (e) => {
                if (!e.features?.length) return;

                const feature = e.features[0];

                const rawName =
                    feature.properties?.NAME_LATN ||
                    feature.properties?.NUTS_NAME;

                if (!rawName) return;

                const slug = latinize(rawName)
                    .toLowerCase()
                    .replace(/\s+/g, "-");

                router.push(`/c/${slug}`);
            });

            map.on("mouseenter", "city-fill", () => {
                map.getCanvas().style.cursor = "pointer";
            });

            map.on("mouseleave", "bosnia-fill", () => {
                popupRef.current?.remove();
                map.getCanvas().style.cursor = "";
            });

            map.on("mouseleave", "kosovo-fill", () => {
                popupRef.current?.remove();
                map.getCanvas().style.cursor = "";
            });

            map.on("mouseleave", "city-fill", () => {
                if (hoveredCityId !== null) {
                    map.setFeatureState({ source: "nuts", id: hoveredCityId }, { hover: false });
                }
                hoveredCityId = null;
                popupRef.current?.remove();
                map.getCanvas().style.cursor = "";
            });

        });

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);



    return <div ref={mapContainer} className="w-full h-screen" />;
}
