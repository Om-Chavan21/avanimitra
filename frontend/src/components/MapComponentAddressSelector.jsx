import React, { useState, useRef, useEffect } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
    width: "100%",
    height: "500px", // Updated height to match split-layout
};

const MapComponent = ({ onLocationSelect }) => {
    const [address, setAddress] = useState("");
    const [aptSuite, setAptSuite] = useState("");
    const [city, setCity] = useState("");
    const [stateProvince, setStateProvince] = useState("");
    const [zipPostal, setZipPostal] = useState("");
    const [country, setCountry] = useState("");
    const locationInputRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ["places", "maps", "marker"],
    });

    useEffect(() => {
        if (isLoaded) {
            initMap();
        }
    }, [isLoaded]);

    const initMap = () => {
        const mapOptions = {
            center: { lat: 18.5123803, lng: 73.805599 },
            fullscreenControl: true,
            mapTypeControl: false,
            streetViewControl: true,
            zoom: 13,
            zoomControl: true,
            maxZoom: 22,
            mapId: "DEMO_MAP_ID",
        };

        mapRef.current = new window.google.maps.Map(
            document.getElementById("map"),
            mapOptions
        );

        markerRef.current = new window.google.maps.marker.AdvancedMarkerElement(
            {
                map: mapRef.current,
                position: mapOptions.center,
            }
        );

        const autocomplete = new window.google.maps.places.Autocomplete(
            document.getElementById("location-input"),
            {
                fields: ["address_components", "geometry", "name"],
                types: ["address"],
            }
        );

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();

            if (!place.geometry) {
                window.alert(`No details available for input: '${place.name}'`);
                return;
            }

            renderAddress(place);
            fillInAddress(place);
        });
    };

    const renderAddress = (place) => {
        if (place.geometry && place.geometry.location) {
            mapRef.current.setCenter(place.geometry.location);
            markerRef.current.position = place.geometry.location;
            markerRef.current.map = mapRef.current;
        } else {
            markerRef.current.position = null;
            markerRef.current.map = null;
        }
    };

    const fillInAddress = (place) => {
        function getComponentName(componentType) {
            for (const component of place.address_components || []) {
                if (component.types[0] === componentType) {
                    return SHORT_NAME_ADDRESS_COMPONENT_TYPES.has(componentType)
                        ? component.short_name
                        : component.long_name;
                }
            }
            return "";
        }

        function getComponentText(componentType) {
            return componentType === "location"
                ? `${getComponentName("street_number")} ${getComponentName(
                      "route"
                  )}`
                : getComponentName(componentType);
        }

        setAddress(getComponentText("location"));
        setCity(getComponentName("locality"));
        setStateProvince(getComponentName("administrative_area_level_1"));
        setZipPostal(getComponentName("postal_code"));
        setCountry(getComponentName("country"));

        const location = place.geometry.location;
        onLocationSelect(
            `https://www.google.com/maps?q=${location.lat()},${location.lng()}`
        );
    };

    const SHORT_NAME_ADDRESS_COMPONENT_TYPES = new Set([
        "street_number",
        "administrative_area_level_1",
        "postal_code",
    ]);

    const handleSubmit = () => {
        // Handle the submission of address details
        console.log("Address:", address);
        console.log("Apt/Suite:", aptSuite);
        console.log("City:", city);
        console.log("State/Province:", stateProvince);
        console.log("Zip/Postal Code:", zipPostal);
        console.log("Country:", country);
    };

    if (loadError) {
        return <div>Error loading maps</div>;
    }

    return isLoaded ? (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    display: "flex",
                    width: "600px",
                    height: "500px",
                    border: "1px solid #ccc",
                }}
            >
                <div
                    className="panel"
                    style={{
                        background: "white",
                        boxSizing: "border-box",
                        height: "100%",
                        width: "100%",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-around",
                    }}
                >
                    <div>
                        <img
                            className="sb-title-icon"
                            src="https://fonts.gstatic.com/s/i/googlematerialicons/location_pin/v5/24px.svg"
                            alt=""
                            style={{ position: "relative", top: "-5px" }}
                        />
                        <span
                            className="sb-title"
                            style={{
                                position: "relative",
                                top: "-12px",
                                fontFamily: "Roboto, sans-serif",
                                fontWeight: "500",
                            }}
                        >
                            Address Selection
                        </span>
                    </div>
                    <input
                        type="text"
                        placeholder="Address"
                        id="location-input"
                        ref={locationInputRef}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Apt, Suite, etc (optional)"
                        value={aptSuite}
                        onChange={(e) => setAptSuite(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="City"
                        id="locality-input"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                    <div
                        className="half-input-container"
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <input
                            type="text"
                            className="half-input"
                            placeholder="State/Province"
                            id="administrative_area_level_1-input"
                            value={stateProvince}
                            onChange={(e) => setStateProvince(e.target.value)}
                            style={{ maxWidth: "120px" }}
                        />
                        <input
                            type="text"
                            className="half-input"
                            placeholder="Zip/Postal code"
                            id="postal_code-input"
                            value={zipPostal}
                            onChange={(e) => setZipPostal(e.target.value)}
                            style={{ maxWidth: "120px" }}
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Country"
                        id="country-input"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    />
                    <button
                        onClick={handleSubmit}
                        style={{
                            backgroundColor: "#4CAF50",
                            color: "white",
                            padding: "10px 20px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        Select Location
                    </button>
                </div>
                <div id="map" style={{ width: "100%", height: "100%" }}></div>
            </div>
            {/* Styles */}
            <style>
                {`
                .sb-title {
                    position: relative;
                    top: -12px;
                    font-family: Roboto, sans-serif;
                    font-weight: 500;
                }

                .sb-title-icon {
                    position: relative;
                    top: -5px;
                }

                .panel {
                    background: white;
                    box-sizing: border-box;
                    height: 100%;
                    width: 100%;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-around;
                }

                .half-input-container {
                    display: flex;
                    justify-content: space-between;
                }

                .half-input {
                    max-width: 120px;
                }

                input {
                    border: 0;
                    border-bottom: 1px solid black;
                    font-size: 14px;
                    font-family: Roboto, sans-serif;
                    font-style: normal;
                    font-weight: normal;
                }

                input:focus::placeholder {
                    color: white;
                }
            `}
            </style>
        </div>
    ) : (
        <div>Loading...</div>
    );
};

export default MapComponent;
