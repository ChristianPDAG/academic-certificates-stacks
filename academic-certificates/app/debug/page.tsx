"use client";

import { useState } from 'react';
import {
    getStudentCertificatesClient,
    getCertificateClient,
    getTotalCertificatesClient,
    getSuperAdminClient,
    getSchoolInfoClient,
    getSchoolCertificatesClient
} from '@/lib/stacks-client';

export default function DebugPage() {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const addResult = (test: string, result: any) => {
        setResults(prev => [...prev, { test, result, timestamp: new Date().toLocaleTimeString() }]);
    };

    const runTests = async () => {
        setLoading(true);
        setResults([]);

        // Test 1: Verificar total de certificados
        try {
            const total = await getTotalCertificatesClient();
            addResult("Total de certificados", total);
        } catch (error) {
            addResult("Total de certificados - ERROR", error);
        }

        // Test 2: Verificar super admin
        try {
            const admin = await getSuperAdminClient();
            addResult("Super Admin", admin);
        } catch (error) {
            addResult("Super Admin - ERROR", error);
        }

        // Test 3: Verificar certificado #1
        try {
            const cert1 = await getCertificateClient(1);
            addResult("Certificado ID 1", cert1);
        } catch (error) {
            addResult("Certificado ID 1 - ERROR", error);
        }

        // Test 4: Verificar certificado #2
        try {
            const cert2 = await getCertificateClient(2);
            addResult("Certificado ID 2", cert2);
        } catch (error) {
            addResult("Certificado ID 2 - ERROR", error);
        }

        // Test 5: Verificar certificado #3
        try {
            const cert3 = await getCertificateClient(3);
            addResult("Certificado ID 3", cert3);
        } catch (error) {
            addResult("Certificado ID 3 - ERROR", error);
        }

        setLoading(false);
    };

    const testSpecificStudent = async (address: string) => {
        if (!address.trim()) return;

        setLoading(true);
        try {
            const result = await getStudentCertificatesClient(address.trim());
            addResult(`Certificados para ${address}`, result);
        } catch (error) {
            addResult(`Certificados para ${address} - ERROR`, error);
        }
        setLoading(false);
    };

    const testSpecificCertificate = async (certId: string) => {
        const id = parseInt(certId);
        if (isNaN(id)) return;
        
        setLoading(true);
        try {
            const result = await getCertificateClient(id);
            addResult(`Certificado ID ${id}`, result);
        } catch (error) {
            addResult(`Certificado ID ${id} - ERROR`, error);
        }
        setLoading(false);
    };

    const testSchoolInfo = async (schoolAddress: string) => {
        if (!schoolAddress.trim()) return;
        
        setLoading(true);
        try {
            const result = await getSchoolInfoClient(schoolAddress.trim());
            addResult(`Información de escuela ${schoolAddress}`, result);
        } catch (error) {
            addResult(`Información de escuela ${schoolAddress} - ERROR`, error);
        }
        setLoading(false);
    };

    const testSchoolCertificates = async (schoolAddress: string) => {
        if (!schoolAddress.trim()) return;
        
        setLoading(true);
        try {
            const result = await getSchoolCertificatesClient(schoolAddress.trim());
            addResult(`Certificados de escuela ${schoolAddress}`, result);
        } catch (error) {
            addResult(`Certificados de escuela ${schoolAddress} - ERROR`, error);
        }
        setLoading(false);
    };

    const testTotalCertificates = async () => {
        setLoading(true);
        try {
            const result = await getTotalCertificatesClient();
            addResult("Total de certificados del sistema", result);
        } catch (error) {
            addResult("Total de certificados del sistema - ERROR", error);
        }
        setLoading(false);
    };    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8">🔧 Debug del Smart Contract</h1>

            {/* Configuración actual */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">📋 Configuración Actual</h2>
                <div className="space-y-2 text-sm font-mono">
                    <div><strong>Dirección del contrato:</strong> {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "ST15Z41T89K34CD6Q1N8DX2VZGCP50ATNAHPFXMBV"}</div>
                    <div><strong>Nombre del contrato:</strong> {process.env.NEXT_PUBLIC_CONTRACT_NAME || "nft"}</div>
                    <div><strong>Red:</strong> {process.env.NEXT_PUBLIC_NETWORK || "testnet"}</div>
                </div>
            </div>

            {/* Tests automáticos */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">🧪 Tests Automáticos</h2>
                <button
                    onClick={runTests}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md mb-4"
                >
                    {loading ? 'Ejecutando tests...' : 'Ejecutar Tests Básicos'}
                </button>
            </div>

            {/* Tests manuales */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Test estudiante específico */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">👤 Test Estudiante Específico</h3>
                    <div className="space-y-3">
                        <input
                            id="studentAddress"
                            type="text"
                            placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    testSpecificStudent((e.target as HTMLInputElement).value);
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                const input = document.getElementById('studentAddress') as HTMLInputElement;
                                testSpecificStudent(input.value);
                            }}
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md"
                        >
                            Verificar Estudiante
                        </button>
                    </div>
                </div>

                {/* Test certificado específico */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">🎓 Test Certificado Específico</h3>
                    <div className="space-y-3">
                        <input
                            id="certId"
                            type="number"
                            placeholder="1"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    testSpecificCertificate((e.target as HTMLInputElement).value);
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                const input = document.getElementById('certId') as HTMLInputElement;
                                testSpecificCertificate(input.value);
                            }}
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md"
                        >
                            Verificar Certificado
                        </button>
                    </div>
                </div>
            </div>

            {/* Nuevos Tests de Escuelas */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Test información de escuela */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">🏫 Información de Escuela</h3>
                    <div className="space-y-3">
                        <input
                            id="schoolInfoAddress"
                            type="text"
                            placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    testSchoolInfo((e.target as HTMLInputElement).value);
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                const input = document.getElementById('schoolInfoAddress') as HTMLInputElement;
                                testSchoolInfo(input.value);
                            }}
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md"
                        >
                            Ver Info Escuela
                        </button>
                    </div>
                </div>

                {/* Test certificados de escuela */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">📜 Certificados de Escuela</h3>
                    <div className="space-y-3">
                        <input
                            id="schoolCertsAddress"
                            type="text"
                            placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    testSchoolCertificates((e.target as HTMLInputElement).value);
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                const input = document.getElementById('schoolCertsAddress') as HTMLInputElement;
                                testSchoolCertificates(input.value);
                            }}
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md"
                        >
                            Ver Certificados
                        </button>
                    </div>
                </div>

                {/* Test total de certificados */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">📊 Total del Sistema</h3>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600 mb-4">
                            Obtener el número total de certificados emitidos en todo el sistema.
                        </p>
                        <button
                            onClick={testTotalCertificates}
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md"
                        >
                            Ver Total de Certificados
                        </button>
                    </div>
                </div>
            </div>

            {/* Resultados */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">📊 Resultados</h2>
                {results.length === 0 ? (
                    <p className="text-gray-500">No hay resultados aún. Ejecuta algunos tests.</p>
                ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {results.map((result, index) => (
                            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-800">{result.test}</h4>
                                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                                </div>
                                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                                    {JSON.stringify(result.result, null, 2)}
                                </pre>
                            </div>
                        ))}
                    </div>
                )}

                {results.length > 0 && (
                    <button
                        onClick={() => setResults([])}
                        className="mt-4 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                    >
                        Limpiar Resultados
                    </button>
                )}
            </div>

            {/* Guía de verificación manual */}
            <div className="mt-8 bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">💡 Verificación Manual con Clarinet</h3>
                <div className="text-sm text-yellow-700 space-y-2">
                    <p><strong>1. Total de certificados:</strong></p>
                    <code className="block bg-yellow-100 p-2 rounded font-mono">(contract-call? .nft get-total-certificates)</code>

                    <p><strong>2. Verificar certificado específico:</strong></p>
                    <code className="block bg-yellow-100 p-2 rounded font-mono">(contract-call? .nft get-certificate u1)</code>

                    <p><strong>3. Verificar estudiante específico:</strong></p>
                    <code className="block bg-yellow-100 p-2 rounded font-mono">(contract-call? .nft get-student-certificates 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)</code>
                </div>
            </div>
        </div>
    );
}