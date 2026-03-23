"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FormStep1Props {
  onNext: (data: {
    name: string;
    contact: string;
    email: string;
    eventType: string;
    gameType: string;
    gameMode: string;
    teamSize: string;
    collegeName: string;
    teamName: string;
  }) => void;
  isLoading: boolean;
}

export function FormStep1({ onNext, isLoading }: FormStep1Props) {
  const [formData, setFormData] = useState({
    eventType: "Battle grid",
    gameType: "",
    gameMode: "",
    teamSize: "1",
    collegeName: "",
    teamName: "",
    members: [{ name: "", contact: "", email: "", gameId: "" }], // Captain is members[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.gameType) {
      newErrors.gameType = "Game selection is required";
    }

    if ((formData.gameType === "BGMI" || formData.gameType === "Free Fire") && !formData.gameMode) {
      newErrors.gameMode = "Game mode (Duo/Squad) is required";
    }

    if (!formData.collegeName.trim())
      newErrors.collegeName = "College Name is required";

    if (!formData.teamName.trim())
      newErrors.teamName = "Team Name is required";

    formData.members.forEach(
      (
        member: { name: string; contact: string; email: string; gameId: string },
        index: number,
      ) => {
        if (!member.name.trim()) {
          newErrors[`name_${index}`] = "Name is required";
        }

        if (!member.contact.trim()) {
          newErrors[`contact_${index}`] = "Contact is required";
        } else if (!/^\+?[0-9]{7,}$/.test(member.contact.replace(/\s/g, ""))) {
          newErrors[`contact_${index}`] = "Please enter a valid contact number";
        }

        if (!member.email.trim()) {
          newErrors[`email_${index}`] = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
          newErrors[`email_${index}`] = "Please enter a valid email";
        }

        if (!member.gameId.trim()) {
          newErrors[`gameId_${index}`] = "Game ID is required";
        }
      },
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    const newMembers = [...formData.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData({ ...formData, members: newMembers });
    if (errors[`${field}_${index}`]) {
      setErrors({ ...errors, [`${field}_${index}`]: "" });
    }
  };

  // For Battle grid only, keep team-size driven member structure

  const handleGameTypeChange = (gameType: string) => {
    // Valorant fixed 5; BGMI/Free Fire require mode selection
    const teamSize = gameType === "Valorant" ? "5" : "";
    const count = gameType === "Valorant" ? 5 : 0;
    const newMembers = Array.from({ length: count }, () => ({
      name: "",
      contact: "",
      email: "",
      gameId: "",
    }));

    setFormData({
      ...formData,
      gameType,
      gameMode: "",
      teamSize,
      members: gameType === "Valorant" ? newMembers : [],
    });
    setErrors({});
  };

  const handleGameModeChange = (gameMode: string) => {
    const count = gameMode === "Duo" ? 2 : 4;
    const newMembers = Array.from({ length: count }, () => ({
      name: "",
      contact: "",
      email: "",
    }));

    setFormData({ ...formData, gameMode, teamSize: count.toString(), members: newMembers });
    if (errors.gameMode) {
      const newErrors = { ...errors };
      delete newErrors.gameMode;
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onNext({
          name: formData.members[0].name,
          contact: formData.members[0].contact,
          email: formData.members[0].email,
          eventType: formData.eventType,
          gameType: formData.gameType,
          gameMode: formData.gameMode,
          teamSize: formData.teamSize,
          collegeName: formData.collegeName,
          teamName: formData.teamName,
        });
      } else {
        setErrors({ form: "Failed to submit form" });
        setIsSubmitting(false);
      }
    } catch (error) {
      setErrors({ form: "An error occurred. Please try again." });
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-md"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-50 mb-2">
          Event Registration
        </h2>
        <p className="text-zinc-400">Please provide your team details below</p>
      </motion.div>

      {errors.form && (
        <motion.div
          variants={itemVariants}
          className="mb-6 p-4 bg-red-950 border border-red-800 rounded-lg text-red-200"
        >
          {errors.form}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="mb-6">
        <p className="text-sm font-medium text-zinc-300 mb-1">Event</p>
        <div className="w-full h-10 px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-50 rounded-md flex items-center">
          Battle grid
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Game
        </label>
        <select
          value={formData.gameType}
          onChange={(e) => handleGameTypeChange(e.target.value)}
          className="w-full h-10 px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-50 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
        >
          <option value="" disabled>
            Select Game
          </option>
          <option value="Valorant">Valorant</option>
          <option value="BGMI">BGMI</option>
          <option value="Free Fire">Free Fire</option>
        </select>
        {errors.gameType && (
          <p className="text-red-400 text-sm mt-2">{errors.gameType}</p>
        )}
      </motion.div>

      {formData.gameType === "BGMI" || formData.gameType === "Free Fire" ? (
        <motion.div variants={itemVariants} className="mb-6">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Mode
          </label>
          <select
            value={formData.gameMode}
            onChange={(e) => handleGameModeChange(e.target.value)}
            className="w-full h-10 px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-50 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <option value="" disabled>
              Select Mode
            </option>
            <option value="Duo">Duo</option>
            <option value="Squad">Squad</option>
          </select>
          {errors.gameMode && (
            <p className="text-red-400 text-sm mt-2">{errors.gameMode}</p>
          )}
        </motion.div>
      ) : formData.gameType === "Valorant" ? (
        <motion.div variants={itemVariants} className="mb-6">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Team Size
          </label>
          <div className="w-full h-10 px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-50 rounded-md flex items-center">
            5 Members (Valorant 5v5 required)
          </div>
        </motion.div>
      ) : null}

      <motion.div variants={itemVariants} className="mb-6">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Team Name
        </label>
        <Input
          type="text"
          placeholder="Enter your team name"
          value={formData.teamName}
          onChange={(e) => {
            setFormData({ ...formData, teamName: e.target.value });
            if (errors.teamName)
              setErrors({ ...errors, teamName: "" });
          }}
          className="w-full bg-zinc-900 border-zinc-700 text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-zinc-500"
        />
        {errors.teamName && (
          <p className="text-red-400 text-sm mt-2">
            {errors.teamName}
          </p>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          College Name
        </label>
              <Input
                type="text"
                placeholder="Enter your college name"
                value={formData.collegeName}
                onChange={(e) => {
                  setFormData({ ...formData, collegeName: e.target.value });
                  if (errors.collegeName)
                    setErrors({ ...errors, collegeName: "" });
                }}
                className="w-full bg-zinc-900 border-zinc-700 text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-zinc-500"
              />
              {errors.collegeName && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.collegeName}
                </p>
              )}
            </motion.div>

            {(formData.gameType === "Valorant" || formData.gameMode) && formData.members.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="mb-6 p-4 border border-zinc-800 rounded-lg bg-zinc-900/50"
              >
                <h3 className="text-lg font-medium text-zinc-200 mb-4 border-b border-zinc-800 pb-2">
                  {index === 0 ? "Member 1 (Captain)" : `Member ${index + 1}`}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Name
                    </label>
                    <Input
                      type="text"
                      placeholder={`Enter ${index === 0 ? "Captain" : `Member ${index + 1}`} Name`}
                      value={member.name}
                      onChange={(e) =>
                        handleMemberChange(index, "name", e.target.value)
                      }
                      className="w-full bg-zinc-900 border-zinc-700 text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-zinc-500"
                    />
                    {errors[`name_${index}`] && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors[`name_${index}`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Contact Number
                    </label>
                    <Input
                      type="tel"
                      placeholder={`Enter ${index === 0 ? "Captain" : `Member ${index + 1}`} Contact`}
                      value={member.contact}
                      onChange={(e) =>
                        handleMemberChange(index, "contact", e.target.value)
                      }
                      className="w-full bg-zinc-900 border-zinc-700 text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-zinc-500"
                    />
                    {errors[`contact_${index}`] && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors[`contact_${index}`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder={`Enter ${index === 0 ? "Captain" : `Member ${index + 1}`} Email`}
                      value={member.email}
                      onChange={(e) =>
                        handleMemberChange(index, "email", e.target.value)
                      }
                      className="w-full bg-zinc-900 border-zinc-700 text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-zinc-500"
                    />
                    {errors[`email_${index}`] && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors[`email_${index}`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Game ID / User ID
                    </label>
                    <Input
                      type="text"
                      placeholder={`Enter ${index === 0 ? "Captain" : `Member ${index + 1}`} Game ID`}
                      value={member.gameId}
                      onChange={(e) =>
                        handleMemberChange(index, "gameId", e.target.value)
                      }
                      className="w-full bg-zinc-900 border-zinc-700 text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-zinc-500"
                    />
                    {errors[`gameId_${index}`] && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors[`gameId_${index}`]}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
      <motion.div variants={itemVariants}>
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !formData.gameType ||
            (formData.gameType !== "Valorant" && !formData.gameMode) ||
            formData.members.length === 0
          }
          className="w-full bg-zinc-50 text-zinc-950 hover:bg-zinc-200 font-semibold h-12 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Submitting...
            </span>
          ) : "Continue to Payment"}
        </Button>
      </motion.div>
    </motion.form>
  );
}