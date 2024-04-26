import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { useParams } from "react-router";
import RequestCard from "../../components/AcceptedRequestCard/RequestCard";
import "./Request.css";

export const Request = () => {
  const dummydata = {
    prescriptionID: 1,
    patientData: {
      name: "ABC",
      age: "30",
      gender: "Female",
      symptoms: ["Fever", "Cough", "Fatigue"],
    },
    diseaseData: [
      "Common Cold",
      "Influenza",
      "Pneumonia",
      "Bronchitis",
      "Asthma",
      "COVID-19",
    ],
  };

  const { id } = useParams();

  useEffect(() => {
    console.log(id);
    const fun = async () => {};

    fun();
  }, [id]);

  return (
    <div className="page">
      <Navbar />
      <RequestCard data={dummydata} />
      <Footer />
    </div>
  );
};
