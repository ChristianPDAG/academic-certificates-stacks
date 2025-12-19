"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface MultiSelectSkillsProps {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
}

export function MultiSelectSkills({
    value,
    onChange,
    placeholder = "Escribe una habilidad y presiona Enter",
}: MultiSelectSkillsProps) {
    const [inputValue, setInputValue] = React.useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            const trimmedValue = inputValue.trim();

            // Avoid duplicates
            if (!value.includes(trimmedValue)) {
                onChange([...value, trimmedValue]);
            }
            setInputValue("");
        } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
            // Remove last skill if backspace is pressed on empty input
            onChange(value.slice(0, -1));
        }
    };

    const removeSkill = (skillToRemove: string) => {
        onChange(value.filter((skill) => skill !== skillToRemove));
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border rounded-md bg-background">
                {value.map((skill) => (
                    <Badge
                        key={skill}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1"
                    >
                        {skill}
                        <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Eliminar {skill}</span>
                        </button>
                    </Badge>
                ))}
                <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ""}
                    className="flex-1 min-w-[120px] border-0 shadow-none focus-visible:ring-0 px-0"
                />
            </div>
            <p className="text-xs text-muted-foreground">
                Presiona Enter para agregar. Ejemplos: React, Solidity, Smart Contracts
            </p>
        </div>
    );
}
