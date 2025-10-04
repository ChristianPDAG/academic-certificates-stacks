;; Contrato de Certificados Academicos Multi-Escuela
;; Permite a multiples escuelas emitir certificados que se almacenan automaticamente en la wallet del estudiante
;; Constantes para errores
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_CERTIFICATE_NOT_FOUND (err u101))
(define-constant ERR_CERTIFICATE_ALREADY_EXISTS (err u102))
(define-constant ERR_SCHOOL_NOT_ACTIVE (err u103))
(define-constant ERR_SCHOOL_ALREADY_EXISTS (err u104))

;; Variable que define quien es el super-admin del sistema
(define-data-var super-admin principal tx-sender)

;; Contador para generar numeros de serie unicos
(define-data-var certificate-counter uint u0)

;; Mapa de escuelas autorizadas
(define-map authorized-schools
    { school-principal: principal }
    {
        school-name: (string-ascii 100),
        active: bool,
    }
)

;; Estructura del certificado
(define-map certificates
    { certificate-id: uint }
    {
        school-id: principal, ;; Wallet de la escuela emisora
        student-id: (string-ascii 50), ;; ID anonimizado del estudiante
        course: (string-ascii 100), ;; Nombre del curso
        grade: (string-ascii 10), ;; Calificacion
        student-wallet: principal, ;; Wallet del estudiante donde se almacena
    }
)

;; Mapa para relacionar estudiante con sus certificados
(define-map student-certificates
    { student-wallet: principal }
    { certificate-ids: (list 100 uint) }
)

;; Mapa para relacionar escuela con sus certificados emitidos
(define-map school-certificates
    { school-principal: principal }
    { certificate-ids: (list 1000 uint) }
)

;; Funcion para verificar si el caller es el super-admin
(define-private (is-super-admin)
    (is-eq tx-sender (var-get super-admin))
)

;; Funcion para verificar si una escuela esta autorizada y activa
(define-private (is-authorized-school)
    (match (map-get? authorized-schools { school-principal: tx-sender })
        school-data (get active school-data)
        false
    )
)

;; Funcion para obtener el siguiente numero de serie
(define-private (get-next-certificate-id)
    (begin
        (var-set certificate-counter (+ (var-get certificate-counter) u1))
        (var-get certificate-counter)
    )
)

;; Funcion para agregar una nueva escuela (solo super-admin)
(define-public (add-school
        (school-principal principal)
        (school-name (string-ascii 100))
    )
    (begin
        ;; Verificar que solo el super-admin puede agregar escuelas
        (asserts! (is-super-admin) ERR_NOT_AUTHORIZED)

        ;; Verificar que la escuela no existe ya
        (asserts!
            (is-none (map-get? authorized-schools { school-principal: school-principal }))
            ERR_SCHOOL_ALREADY_EXISTS
        )

        ;; Agregar la escuela
        (map-set authorized-schools { school-principal: school-principal } {
            school-name: school-name,
            active: true,
        })

        (ok true)
    )
)

;; Funcion para desactivar una escuela (solo super-admin)
(define-public (deactivate-school (school-principal principal))
    (begin
        (asserts! (is-super-admin) ERR_NOT_AUTHORIZED)

        (match (map-get? authorized-schools { school-principal: school-principal })
            school-data (begin
                (map-set authorized-schools { school-principal: school-principal } {
                    school-name: (get school-name school-data),
                    active: false,
                })
                (ok true)
            )
            ERR_CERTIFICATE_NOT_FOUND
        )
    )
)

;; Funcion principal: emitir certificado
;; Solo las escuelas autorizadas pueden llamar esta funcion
(define-public (issue-certificate
        (student-id (string-ascii 50))
        (course (string-ascii 100))
        (grade (string-ascii 10))
        (student-wallet principal)
    )
    (let ((new-cert-id (get-next-certificate-id)))
        ;; Verificar que la escuela esta autorizada
        (asserts! (is-authorized-school) ERR_NOT_AUTHORIZED)

        ;; Crear el certificado
        (map-set certificates { certificate-id: new-cert-id } {
            school-id: tx-sender,
            student-id: student-id,
            course: course,
            grade: grade,
            student-wallet: student-wallet,
        })

        ;; Agregar el certificado a la lista del estudiante
        (let ((current-student-certs (default-to (list)
                (get certificate-ids
                    (map-get? student-certificates { student-wallet: student-wallet })
                ))))
            (map-set student-certificates { student-wallet: student-wallet } { certificate-ids: (unwrap!
                (as-max-len? (append current-student-certs new-cert-id) u100)
                (err u999)
            ) }
            )
        )

        ;; Agregar el certificado a la lista de la escuela
        (let ((current-school-certs (default-to (list)
                (get certificate-ids
                    (map-get? school-certificates { school-principal: tx-sender })
                ))))
            (map-set school-certificates { school-principal: tx-sender } { certificate-ids: (unwrap!
                (as-max-len? (append current-school-certs new-cert-id) u1000)
                (err u998)
            ) }
            )
        )

        ;; Retornar el ID del certificado creado
        (ok new-cert-id)
    )
)

;; Funcion para obtener detalles de un certificado especifico
(define-read-only (get-certificate (cert-id uint))
    (map-get? certificates { certificate-id: cert-id })
)

;; Funcion para obtener todos los certificados de un estudiante
(define-read-only (get-student-certificates (student-wallet principal))
    (map-get? student-certificates { student-wallet: student-wallet })
)

;; Funcion para obtener todos los certificados emitidos por una escuela
(define-read-only (get-school-certificates (school-principal principal))
    (map-get? school-certificates { school-principal: school-principal })
)

;; Funcion para obtener informacion de una escuela
(define-read-only (get-school-info (school-principal principal))
    (map-get? authorized-schools { school-principal: school-principal })
)

;; Funcion para verificar el total de certificados emitidos
(define-read-only (get-total-certificates)
    (var-get certificate-counter)
)

;; Funcion para obtener la direccion del super-admin
(define-read-only (get-super-admin)
    (var-get super-admin)
)

;; Funcion para cambiar el super-admin (solo el actual admin puede hacerlo)
(define-public (change-super-admin (new-admin principal))
    (begin
        (asserts! (is-super-admin) ERR_NOT_AUTHORIZED)
        (var-set super-admin new-admin)
        (ok true)
    )
)
