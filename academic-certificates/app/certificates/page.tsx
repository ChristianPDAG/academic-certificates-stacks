"use client";

import { useState } from 'react';
import { getStudentCertificatesClient, getCertificateClient } from '@/lib/stacks-client';

interface Certificate {
    id: number;
    course: string;
    grade: string;
    'student-id': string;
    'school-id': string;
    'student-wallet': string;
}

export default function CertificatesPage() {
    const [userAddress, setUserAddress] = useState('');
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadCertificates = async () => {
        if (!userAddress.trim()) {
            setError('Por favor ingresa una dirección de billetera');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Obtener IDs de certificados del usuario
            const studentCerts = await getStudentCertificatesClient(userAddress.trim());

            console.log('Raw student certs response:', studentCerts);

            if (studentCerts.value && studentCerts.value['certificate-ids']) {
                const rawCertIds = studentCerts.value['certificate-ids'];

                // Parsear los IDs del formato Clarity JSON
                const certIds = rawCertIds.map((idObj: any) => {
                    if (typeof idObj === 'number') {
                        return idObj;
                    }
                    if (idObj && idObj.value) {
                        return parseInt(idObj.value);
                    }
                    return parseInt(idObj);
                });

                console.log('Parsed cert IDs:', certIds);

                if (certIds.length === 0) {
                    setCertificates([]);
                    setLoading(false);
                    return;
                }

                // Obtener detalles de cada certificado
                const details = await Promise.all(
                    certIds.map(async (id: number) => {
                        try {
                            console.log(`Fetching certificate ${id}...`);
                            const cert = await getCertificateClient(id);
                            console.log(`Certificate ${id} response:`, cert);

                            if (cert.value) {
                                return { id, ...cert.value };
                            }
                            return null;
                        } catch (err) {
                            console.error(`Error loading certificate ${id}:`, err);
                            return null;
                        }
                    })
                );

                const validCertificates = details.filter(cert => cert !== null);
                console.log('Valid certificates:', validCertificates);
                setCertificates(validCertificates);
            } else {
                console.log('No certificate-ids found in response');
                setCertificates([]);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading certificates:', error);
            setError('Error al cargar los certificados. Verifica la dirección.');
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center">
                Consultar Certificados Académicos
            </h1>

            {/* Formulario de búsqueda */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex flex-col space-y-4">
                    <label htmlFor="userAddress" className="text-sm font-medium text-gray-700">
                        Dirección de Billetera del Estudiante:
                    </label>
                    <input
                        id="userAddress"
                        type="text"
                        value={userAddress}
                        onChange={(e) => setUserAddress(e.target.value)}
                        placeholder="Ej: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={loadCertificates}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                        {loading ? 'Cargando...' : 'Consultar Certificados'}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
            </div>

            {/* Resultados */}
            {loading && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Consultando blockchain...</p>
                </div>
            )}

            {!loading && userAddress && certificates.length === 0 && !error && (
                <div className="text-center py-8 bg-gray-100 rounded-lg">
                    <p className="text-gray-600">No se encontraron certificados para esta dirección.</p>
                </div>
            )}

            {certificates.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-6">
                        Certificados Encontrados ({certificates.length})
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {certificates.map((cert) => (
                            <div key={cert.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {cert.course}
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">ID Certificado:</span>
                                            <span className="ml-2 text-gray-900">#{cert.id}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Calificación:</span>
                                            <span className="ml-2 text-green-600 font-medium">{cert.grade}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">ID Estudiante:</span>
                                            <span className="ml-2 text-gray-900">{cert['student-id']}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Escuela:</span>
                                            <span className="ml-2 text-blue-600 text-xs font-mono">
                                                {cert['school-id'].substring(0, 10)}...
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Billetera:</span>
                                            <span className="ml-2 text-blue-600 text-xs font-mono">
                                                {cert['student-wallet'].substring(0, 10)}...
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                            ✓ Verificado en Blockchain
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Información adicional */}
            <div className="mt-12 bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    ℹ️ Información sobre los Certificados
                </h3>
                <div className="text-sm text-blue-800 space-y-2">
                    <p>• Los certificados están almacenados de forma permanente en el blockchain de Stacks</p>
                    <p>• Cada certificado tiene un ID único y no puede ser modificado una vez emitido</p>
                    <p>• Para consultar certificados, necesitas la dirección exacta de la billetera del estudiante</p>
                    <p>• Los certificados pueden ser verificados por cualquier persona usando esta interfaz</p>
                </div>
            </div>
        </div>
    );
}
