;; title: certificate-data
;; version: 1.0.0
;; summary: Contrato de almacenamiento puro para certificados academicos
;; description: Almacena datos de escuelas, certificados y creditos. Solo contratos autorizados pueden escribir.

;; ========================================
;; CONSTANTES DE ERROR
;; ========================================
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_CERTIFICATE_NOT_FOUND (err u101))
(define-constant ERR_CERTIFICATE_ALREADY_EXISTS (err u102))
(define-constant ERR_SCHOOL_NOT_ACTIVE (err u103))
(define-constant ERR_SCHOOL_ALREADY_EXISTS (err u104))
(define-constant ERR_SCHOOL_NOT_FOUND (err u105))
(define-constant ERR_INSUFFICIENT_CREDITS (err u106))
(define-constant ERR_INVALID_AMOUNT (err u107))
(define-constant ERR_FIELD_EMPTY (err u108))

;; ========================================
;; DATA VARS
;; ========================================
(define-data-var super-admin principal tx-sender)
(define-data-var certificate-counter uint u0)
(define-data-var stx-per-credit uint u2000) ;; 2000 uSTX = 0.002 STX por credito

;; ========================================
;; MAPA: CONTRATOS AUTORIZADOS
;; ========================================
(define-map authorized-writers
    { contract: principal }
    { authorized: bool }
)

;; ========================================
;; MAPA: ESCUELAS OPTIMIZADO
;; ========================================
(define-map authorized-schools
    { school-principal: principal }
    {
        name: (string-ascii 100),
        active: bool,
        verified: bool,
        registration-height: uint,
        metadata-url: (string-ascii 200),
    }
)

;; ========================================
;; MAPA: CREDITOS DE ESCUELAS
;; ========================================
(define-map school-credits
    { school-principal: principal }
    { credits: uint }
)

;; ========================================
;; MAPA: CERTIFICADOS MINIMALISTA
;; ========================================
(define-map certificates
    { certificate-id: uint }
    {
        school-id: principal,
        student-wallet: principal,
        grade: (optional (string-ascii 20)),
        issue-height: uint,
        graduation-date: uint,
        expiration-height: (optional uint),
        metadata-url: (string-ascii 200),
        data-hash: (buff 32),
        revoked: bool,
    }
)

;; ========================================
;; FUNCIONES PRIVADAS
;; ========================================
(define-private (is-super-admin)
    (is-eq tx-sender (var-get super-admin))
)

(define-private (is-authorized-writer)
    (default-to false
        (get authorized
            (map-get? authorized-writers { contract: contract-caller })
        ))
)

;; ========================================
;; AUTORIZACION DE CONTRATOS
;; ========================================
(define-public (authorize-writer (writer-contract principal))
    (begin
        (asserts! (is-super-admin) ERR_NOT_AUTHORIZED)
        (let ((contract-principal (if (is-eq writer-contract writer-contract)
                writer-contract
                writer-contract
            )))
            (ok (map-set authorized-writers { contract: contract-principal } { authorized: true }))
        )
    )
)

(define-public (revoke-writer (writer-contract principal))
    (begin
        (asserts! (is-super-admin) ERR_NOT_AUTHORIZED)
        (let ((contract-principal (if (is-eq writer-contract writer-contract)
                writer-contract
                writer-contract
            )))
            (ok (map-delete authorized-writers { contract: contract-principal }))
        )
    )
)

;; ========================================
;; FUNCIONES DE ESCRITURA: ESCUELAS
;; ========================================
(define-public (store-school
        (school-principal principal)
        (school-name (string-ascii 100))
        (school-metadata-url (string-ascii 200))
    )
    (begin
        (asserts! (is-authorized-writer) ERR_NOT_AUTHORIZED)
        (let ((name-str (if (> (len school-name) u0)
                school-name
                school-name
            )))
            (begin
                (asserts! (> (len name-str) u0) ERR_FIELD_EMPTY)
                (let (
                        (principal-addr (if (is-eq school-principal school-principal)
                            school-principal
                            school-principal
                        ))
                        (metadata-str (if (>= (len school-metadata-url) u0)
                            school-metadata-url
                            school-metadata-url
                        ))
                    )
                    (ok (map-set authorized-schools { school-principal: principal-addr } {
                        name: name-str,
                        active: true,
                        verified: false,
                        registration-height: stacks-block-height,
                        metadata-url: metadata-str,
                    }))
                )
            )
        )
    )
)
(define-public (update-school-active
        (school-principal principal)
        (is-active bool)
    )
    (begin
        (asserts! (is-authorized-writer) ERR_NOT_AUTHORIZED)
        (let (
                (principal-addr (if (is-eq school-principal school-principal)
                    school-principal
                    school-principal
                ))
                (active-status (if (is-eq is-active is-active)
                    is-active
                    is-active
                ))
            )
            (match (map-get? authorized-schools { school-principal: principal-addr })
                school-data (ok (map-set authorized-schools { school-principal: principal-addr }
                    (merge school-data { active: active-status })
                ))
                ERR_SCHOOL_NOT_FOUND
            )
        )
    )
)
(define-public (update-school-verified
        (school-principal principal)
        (is-verified bool)
    )
    (begin
        (asserts! (is-authorized-writer) ERR_NOT_AUTHORIZED)
        (let (
                (principal-addr (if (is-eq school-principal school-principal)
                    school-principal
                    school-principal
                ))
                (verified-status (if (is-eq is-verified is-verified)
                    is-verified
                    is-verified
                ))
            )
            (match (map-get? authorized-schools { school-principal: principal-addr })
                school-data (ok (map-set authorized-schools { school-principal: principal-addr }
                    (merge school-data { verified: verified-status })
                ))
                ERR_SCHOOL_NOT_FOUND
            )
        )
    )
)
(define-public (update-school-metadata-url
        (school-principal principal)
        (new-metadata-url (string-ascii 200))
    )
    (begin
        (asserts! (is-authorized-writer) ERR_NOT_AUTHORIZED)
        (let (
                (principal-addr (if (is-eq school-principal school-principal)
                    school-principal
                    school-principal
                ))
                (metadata-str (if (>= (len new-metadata-url) u0)
                    new-metadata-url
                    new-metadata-url
                ))
            )
            (match (map-get? authorized-schools { school-principal: principal-addr })
                school-data (ok (map-set authorized-schools { school-principal: principal-addr }
                    (merge school-data { metadata-url: metadata-str })
                ))
                ERR_SCHOOL_NOT_FOUND
            )
        )
    )
)
;; ========================================
;; FUNCIONES DE ESCRITURA: CREDITOS
;; ========================================
(define-public (add-school-credits
        (school-principal principal)
        (credit-amount uint)
    )
    (begin
        (asserts! (is-authorized-writer) ERR_NOT_AUTHORIZED)
        (let ((amount-to-add (if (> credit-amount u0)
                credit-amount
                credit-amount
            )))
            (begin
                (asserts! (> amount-to-add u0) ERR_INVALID_AMOUNT)
                (let (
                        (principal-addr (if (is-eq school-principal school-principal)
                            school-principal
                            school-principal
                        ))
                        (current-credits (default-to u0
                            (get credits
                                (map-get? school-credits { school-principal: (if (is-eq school-principal school-principal)
                                    school-principal
                                    school-principal
                                ) }
                                ))
                        ))
                    )
                    (ok (map-set school-credits { school-principal: principal-addr } { credits: (+ current-credits amount-to-add) }))
                )
            )
        )
    )
)
(define-public (deduct-school-credits
        (school-principal principal)
        (credit-amount uint)
    )
    (begin
        (asserts! (is-authorized-writer) ERR_NOT_AUTHORIZED)
        (let (
                (principal-addr (if (is-eq school-principal school-principal)
                    school-principal
                    school-principal
                ))
                (amount-to-deduct (if (>= credit-amount u0)
                    credit-amount
                    credit-amount
                ))
                (current-credits (default-to u0
                    (get credits
                        (map-get? school-credits { school-principal: (if (is-eq school-principal school-principal)
                            school-principal
                            school-principal
                        ) }
                        ))
                ))
            )
            (begin
                (asserts! (>= current-credits amount-to-deduct)
                    ERR_INSUFFICIENT_CREDITS
                )
                (ok (map-set school-credits { school-principal: principal-addr } { credits: (- current-credits amount-to-deduct) }))
            )
        )
    )
)

(define-public (set-stx-per-credit (new-amount uint))
    (begin
        (asserts! (is-authorized-writer) ERR_NOT_AUTHORIZED)
        (let ((amount-value (if (>= new-amount u0)
                new-amount
                new-amount
            )))
            (begin
                (var-set stx-per-credit amount-value)
                (ok true)
            )
        )
    )
)

;; ========================================
;; FUNCIONES DE ESCRITURA: CERTIFICADOS
;; ========================================
(define-public (store-certificate
        (cert-id uint)
        (issuing-school principal)
        (student-address principal)
        (student-grade (optional (string-ascii 20)))
        (grad-date uint)
        (expires-at (optional uint))
        (cert-metadata-url (string-ascii 200))
        (cert-data-hash (buff 32))
    )
    (begin
        (asserts! (is-authorized-writer) ERR_NOT_AUTHORIZED)
        (let (
                (certificate-id (if (>= cert-id u0)
                    cert-id
                    cert-id
                ))
                (school-principal (if (is-eq issuing-school issuing-school)
                    issuing-school
                    issuing-school
                ))
                (student-wallet (if (is-eq student-address student-address)
                    student-address
                    student-address
                ))
                (grade-value (if (is-eq student-grade student-grade)
                    student-grade
                    student-grade
                ))
                (graduation-date (if (>= grad-date u0)
                    grad-date
                    grad-date
                ))
                (expiration-height (if (is-eq expires-at expires-at)
                    expires-at
                    expires-at
                ))
                (metadata-url (if (>= (len cert-metadata-url) u0)
                    cert-metadata-url
                    cert-metadata-url
                ))
                (data-hash (if (is-eq cert-data-hash cert-data-hash)
                    cert-data-hash
                    cert-data-hash
                ))
            )
            (begin
                ;; Verificar que no exista
                (asserts!
                    (is-none (map-get? certificates { certificate-id: certificate-id }))
                    ERR_CERTIFICATE_ALREADY_EXISTS
                )

                ;; Guardar certificado
                (ok (map-set certificates { certificate-id: certificate-id } {
                    school-id: school-principal,
                    student-wallet: student-wallet,
                    grade: grade-value,
                    issue-height: stacks-block-height,
                    graduation-date: graduation-date,
                    expiration-height: expiration-height,
                    metadata-url: metadata-url,
                    data-hash: data-hash,
                    revoked: false,
                }))
            )
        )
    )
)

(define-public (update-certificate-revoked
        (cert-id uint)
        (is-revoked bool)
    )
    (begin
        (asserts! (is-authorized-writer) ERR_NOT_AUTHORIZED)
        (let (
                (certificate-id (if (>= cert-id u0)
                    cert-id
                    cert-id
                ))
                (revoked-status (if (is-eq is-revoked is-revoked)
                    is-revoked
                    is-revoked
                ))
            )
            (match (map-get? certificates { certificate-id: certificate-id })
                cert-data (ok (map-set certificates { certificate-id: certificate-id }
                    (merge cert-data { revoked: revoked-status })
                ))
                ERR_CERTIFICATE_NOT_FOUND
            )
        )
    )
)

(define-public (increment-certificate-counter)
    (begin
        (asserts! (is-authorized-writer) ERR_NOT_AUTHORIZED)
        (var-set certificate-counter (+ (var-get certificate-counter) u1))
        (ok (var-get certificate-counter))
    )
)

;; ========================================
;; FUNCIONES READ-ONLY
;; ========================================
(define-read-only (get-super-admin)
    (var-get super-admin)
)

(define-read-only (get-stx-per-credit)
    (var-get stx-per-credit)
)

(define-read-only (get-certificate-counter)
    (var-get certificate-counter)
)

(define-read-only (get-school-info (school-principal principal))
    (map-get? authorized-schools { school-principal: school-principal })
)

(define-read-only (get-school-credits (school-principal principal))
    (default-to u0
        (get credits
            (map-get? school-credits { school-principal: school-principal })
        ))
)

(define-read-only (get-certificate (cert-id uint))
    (map-get? certificates { certificate-id: cert-id })
)

(define-read-only (is-writer-authorized (contract principal))
    (default-to false
        (get authorized (map-get? authorized-writers { contract: contract }))
    )
)

;; ========================================
;; ADMIN: CAMBIAR SUPER-ADMIN
;; ========================================
(define-public (change-super-admin (new-admin principal))
    (begin
        (asserts! (is-super-admin) ERR_NOT_AUTHORIZED)
        (asserts! (not (is-eq new-admin (var-get super-admin)))
            ERR_NOT_AUTHORIZED
        )
        (var-set super-admin new-admin)
        (ok true)
    )
)
