;; title: certificate-manager-v1
;; version: 1.0.0
;; summary: Logica de negocio para certificados academicos
;; description: Maneja la emision, revocacion y validacion de certificados con sistema de creditos

;; ========================================
;; CONSTANTES DE ERROR
;; ========================================
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_CERTIFICATE_NOT_FOUND (err u101))
(define-constant ERR_SCHOOL_NOT_ACTIVE (err u103))
(define-constant ERR_SCHOOL_ALREADY_EXISTS (err u104))
(define-constant ERR_SCHOOL_NOT_FOUND (err u105))
(define-constant ERR_INSUFFICIENT_CREDITS (err u106))
(define-constant ERR_INVALID_AMOUNT (err u107))
(define-constant ERR_FIELD_EMPTY (err u108))
(define-constant ERR_INVALID_EXPIRATION_DATE (err u109))
(define-constant ERR_CERTIFICATE_REVOKED (err u110))

;; ========================================
;; FUNCIONES PRIVADAS
;; ========================================
(define-private (is-super-admin)
    (is-eq tx-sender (contract-call? .certificate-data get-super-admin))
)

(define-private (is-authorized-school)
    (match (contract-call? .certificate-data get-school-info tx-sender)
        school-data (get active school-data)
        false
    )
)

;; ========================================
;; GESTION DE ESCUELAS
;; ========================================
(define-public (add-school
        (school-principal principal)
        (name (string-ascii 100))
        (metadata-url (string-ascii 200))
    )
    (begin
        ;; Solo super-admin
        (asserts! (is-super-admin) ERR_NOT_AUTHORIZED)

        ;; Verificar que no exista
        (asserts!
            (is-none (contract-call? .certificate-data get-school-info school-principal))
            ERR_SCHOOL_ALREADY_EXISTS
        )

        ;; Guardar en certificate-data
        (contract-call? .certificate-data store-school school-principal name
            metadata-url
        )
    )
)

(define-public (deactivate-school (school-principal principal))
    (begin
        (asserts! (is-super-admin) ERR_NOT_AUTHORIZED)
        (contract-call? .certificate-data update-school-active school-principal
            false
        )
    )
)

(define-public (reactivate-school (school-principal principal))
    (begin
        (asserts! (is-super-admin) ERR_NOT_AUTHORIZED)
        (contract-call? .certificate-data update-school-active school-principal
            true
        )
    )
)

(define-public (verify-school (school-principal principal))
    (begin
        (asserts! (is-super-admin) ERR_NOT_AUTHORIZED)
        (contract-call? .certificate-data update-school-verified school-principal
            true
        )
    )
)

(define-public (unverify-school (school-principal principal))
    (begin
        (asserts! (is-super-admin) ERR_NOT_AUTHORIZED)
        (contract-call? .certificate-data update-school-verified school-principal
            false
        )
    )
)

(define-public (update-school-metadata-url
        (school-principal principal)
        (metadata-url (string-ascii 200))
    )
    (begin
        (asserts! (is-super-admin) ERR_NOT_AUTHORIZED)
        (contract-call? .certificate-data update-school-metadata-url
            school-principal metadata-url
        )
    )
)

;; ========================================
;; SISTEMA DE CREDITOS
;; ========================================
(define-public (admin-fund-school
        (school-principal principal)
        (credits uint)
    )
    (begin
        ;; Solo super-admin
        (asserts! (is-super-admin) ERR_NOT_AUTHORIZED)
        (asserts! (> credits u0) ERR_INVALID_AMOUNT)

        ;; Verificar que la escuela existe
        (asserts!
            (is-some (contract-call? .certificate-data get-school-info school-principal))
            ERR_SCHOOL_NOT_FOUND
        )

        ;; Calcular costo en STX
        (let ((stx-amount (* credits (contract-call? .certificate-data get-stx-per-credit))))
            ;; Transferir STX de super-admin al contrato de datos
            (try! (stx-transfer? stx-amount tx-sender (as-contract tx-sender)))

            ;; Agregar creditos a la escuela
            (contract-call? .certificate-data add-school-credits school-principal
                credits
            )
        )
    )
)

(define-public (set-stx-per-credit (new-amount uint))
    (begin
        (asserts! (is-super-admin) ERR_NOT_AUTHORIZED)
        (contract-call? .certificate-data set-stx-per-credit new-amount)
    )
)

;; ========================================
;; EMISION DE CERTIFICADOS
;; ========================================
(define-public (issue-certificate
        (student-wallet principal)
        (grade (optional (string-ascii 20)))
        (graduation-date uint)
        (expiration-height (optional uint))
        (metadata-url (string-ascii 200))
        (data-hash (buff 32))
    )
    (begin
        ;; Validar que la escuela esta autorizada y activa
        (asserts! (is-authorized-school) ERR_NOT_AUTHORIZED)

        ;; Validar que la escuela tenga creditos suficientes
        (let ((school-credits (contract-call? .certificate-data get-school-credits tx-sender)))
            (asserts! (>= school-credits u1) ERR_INSUFFICIENT_CREDITS)

            ;; Deducir 1 credito
            (try! (contract-call? .certificate-data deduct-school-credits tx-sender u1))
        )

        ;; Validar student-wallet
        (asserts! (not (is-eq student-wallet tx-sender)) ERR_NOT_AUTHORIZED)
        (asserts!
            (not (is-eq student-wallet
                (contract-call? .certificate-data get-super-admin)
            ))
            ERR_NOT_AUTHORIZED
        )

        ;; Validar fecha de expiracion si existe
        (asserts!
            (match expiration-height
                exp-height (> exp-height stacks-block-height)
                true
            )
            ERR_INVALID_EXPIRATION_DATE
        )

        ;; Generar nuevo ID
        (let ((new-cert-id (try! (contract-call? .certificate-data increment-certificate-counter))))
            ;; Guardar certificado
            (try! (contract-call? .certificate-data store-certificate new-cert-id
                tx-sender student-wallet grade graduation-date
                expiration-height metadata-url data-hash
            ))

            (ok new-cert-id)
        )
    )
)

;; ========================================
;; GESTION DE CERTIFICADOS
;; ========================================
(define-public (revoke-certificate (cert-id uint))
    (match (contract-call? .certificate-data get-certificate cert-id)
        cert-data (begin
            ;; Verificar permisos: super-admin O escuela emisora
            (asserts!
                (or (is-super-admin) (is-eq tx-sender (get school-id cert-data)))
                ERR_NOT_AUTHORIZED
            )

            ;; Revocar (GRATIS)
            (contract-call? .certificate-data update-certificate-revoked cert-id
                true
            )
        )
        ERR_CERTIFICATE_NOT_FOUND
    )
)

(define-public (reactivate-certificate (cert-id uint))
    (match (contract-call? .certificate-data get-certificate cert-id)
        cert-data (begin
            ;; Verificar permisos: super-admin O escuela emisora
            (asserts!
                (or (is-super-admin) (is-eq tx-sender (get school-id cert-data)))
                ERR_NOT_AUTHORIZED
            )

            ;; Verificar que este revocado
            (asserts! (get revoked cert-data) ERR_NOT_AUTHORIZED)

            ;; Reactivar (GRATIS)
            (contract-call? .certificate-data update-certificate-revoked cert-id
                false
            )
        )
        ERR_CERTIFICATE_NOT_FOUND
    )
)

;; ========================================
;; FUNCIONES READ-ONLY
;; ========================================
(define-read-only (is-certificate-valid (cert-id uint))
    (match (contract-call? .certificate-data get-certificate cert-id)
        cert-data (if (get revoked cert-data)
            (ok false) ;; Revocado
            (match (get expiration-height cert-data)
                exp-height
                (ok (<= stacks-block-height exp-height)) ;; Verificar expiracion
                (ok true) ;; Sin expiracion
            )
        )
        ERR_CERTIFICATE_NOT_FOUND
    )
)

(define-read-only (get-certificate (cert-id uint))
    (contract-call? .certificate-data get-certificate cert-id)
)

(define-read-only (get-school-info (school-principal principal))
    (contract-call? .certificate-data get-school-info school-principal)
)

(define-read-only (get-school-credits (school-principal principal))
    (contract-call? .certificate-data get-school-credits school-principal)
)

(define-read-only (get-total-certificates)
    (contract-call? .certificate-data get-certificate-counter)
)

(define-read-only (get-stx-per-credit)
    (contract-call? .certificate-data get-stx-per-credit)
)
