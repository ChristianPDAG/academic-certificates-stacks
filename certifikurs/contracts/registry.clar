;; title: registry
;; version: 1.0.0
;; summary: Coordinador central del sistema de certificados
;; description: Gestiona que contratos estan autorizados y cual es el manager activo

;; ========================================
;; CONSTANTES DE ERROR
;; ========================================
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_CONTRACT_NOT_FOUND (err u101))

;; ========================================
;; DATA VARS
;; ========================================
(define-data-var super-admin principal tx-sender)
(define-data-var active-manager principal tx-sender) ;; Se actualizara al desplegar certificate-manager-v1

;; ========================================
;; FUNCIONES PRIVADAS
;; ========================================
(define-private (is-super-admin)
    (is-eq tx-sender (var-get super-admin))
)

;; ========================================
;; GESTION DEL MANAGER ACTIVO
;; ========================================
(define-public (set-active-manager (new-manager principal))
    (begin
        (asserts! (is-super-admin) ERR_NOT_AUTHORIZED)
        (let ((manager-principal (if (is-eq new-manager new-manager)
                new-manager
                new-manager
            )))
            (begin
                (var-set active-manager manager-principal)
                (ok true)
            )
        )
    )
)

(define-read-only (get-active-manager)
    (var-get active-manager)
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

(define-read-only (get-super-admin)
    (var-get super-admin)
)
