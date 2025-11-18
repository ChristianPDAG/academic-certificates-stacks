import { describe, it, expect, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!; // School 1
const wallet2 = accounts.get('wallet_2')!; // School 2
const wallet3 = accounts.get('wallet_3')!; // Student 1
const wallet4 = accounts.get('wallet_4')!; // Student 2

describe('academic-certificates', () => {
  
  describe('Super-Admin Functions', () => {
    
    it('returns the correct super-admin on deployment', () => {
      const superAdmin = simnet.callReadOnlyFn('academic-certificates', 'get-super-admin', [], deployer);
      expect(superAdmin.result).toBePrincipal(deployer);
    });

    it('allows super-admin to add a new school', () => {
      const schoolName = 'Harvard University';
      
      const addSchool = simnet.callPublicFn(
        'academic-certificates',
        'add-school',
        [Cl.principal(wallet1), Cl.stringAscii(schoolName)],
        deployer
      );
      
      expect(addSchool.result).toBeOk(Cl.bool(true));
      
      // Verify school was added
      const schoolInfo = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-school-info',
        [Cl.principal(wallet1)],
        deployer
      );
      
      expect(schoolInfo.result).toBeSome(
        Cl.tuple({
          'school-name': Cl.stringAscii(schoolName),
          active: Cl.bool(true),
        })
      );
    });

    it('rejects adding school if not super-admin', () => {
      const addSchool = simnet.callPublicFn(
        'academic-certificates',
        'add-school',
        [Cl.principal(wallet2), Cl.stringAscii('MIT')],
        wallet1 // Not super-admin
      );
      
      expect(addSchool.result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it('rejects adding duplicate school', () => {
      // Add school first time
      simnet.callPublicFn(
        'academic-certificates',
        'add-school',
        [Cl.principal(wallet1), Cl.stringAscii('Stanford')],
        deployer
      );
      
      // Try to add same school again
      const addDuplicate = simnet.callPublicFn(
        'academic-certificates',
        'add-school',
        [Cl.principal(wallet1), Cl.stringAscii('Stanford 2')],
        deployer
      );
      
      expect(addDuplicate.result).toBeErr(Cl.uint(104)); // ERR_SCHOOL_ALREADY_EXISTS
    });

    it('rejects adding school with empty name', () => {
      const addSchool = simnet.callPublicFn(
        'academic-certificates',
        'add-school',
        [Cl.principal(wallet1), Cl.stringAscii('')],
        deployer
      );
      
      expect(addSchool.result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it('rejects adding super-admin as school', () => {
      const addSchool = simnet.callPublicFn(
        'academic-certificates',
        'add-school',
        [Cl.principal(deployer), Cl.stringAscii('Admin School')],
        deployer
      );
      
      expect(addSchool.result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it('allows super-admin to deactivate a school', () => {
      // Add school first
      simnet.callPublicFn(
        'academic-certificates',
        'add-school',
        [Cl.principal(wallet1), Cl.stringAscii('Yale')],
        deployer
      );
      
      // Deactivate school
      const deactivate = simnet.callPublicFn(
        'academic-certificates',
        'deactivate-school',
        [Cl.principal(wallet1)],
        deployer
      );
      
      expect(deactivate.result).toBeOk(Cl.bool(true));
      
      // Verify school is inactive
      const schoolInfo = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-school-info',
        [Cl.principal(wallet1)],
        deployer
      );
      
      expect(schoolInfo.result).toBeSome(
        Cl.tuple({
          'school-name': Cl.stringAscii('Yale'),
          active: Cl.bool(false),
        })
      );
    });

    it('rejects deactivating school if not super-admin', () => {
      // Add school first
      simnet.callPublicFn(
        'academic-certificates',
        'add-school',
        [Cl.principal(wallet1), Cl.stringAscii('Princeton')],
        deployer
      );
      
      // Try to deactivate as non-admin
      const deactivate = simnet.callPublicFn(
        'academic-certificates',
        'deactivate-school',
        [Cl.principal(wallet1)],
        wallet2
      );
      
      expect(deactivate.result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it('allows super-admin to change admin', () => {
      const changeSuperAdmin = simnet.callPublicFn(
        'academic-certificates',
        'change-super-admin',
        [Cl.principal(wallet1)],
        deployer
      );
      
      expect(changeSuperAdmin.result).toBeOk(Cl.bool(true));
      
      // Verify new super-admin
      const newAdmin = simnet.callReadOnlyFn('academic-certificates', 'get-super-admin', [], deployer);
      expect(newAdmin.result).toBePrincipal(wallet1);
    });

    it('rejects changing super-admin if not current admin', () => {
      const changeSuperAdmin = simnet.callPublicFn(
        'academic-certificates',
        'change-super-admin',
        [Cl.principal(wallet2)],
        wallet1 // Not admin
      );
      
      expect(changeSuperAdmin.result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it('rejects changing super-admin to same principal', () => {
      const changeSuperAdmin = simnet.callPublicFn(
        'academic-certificates',
        'change-super-admin',
        [Cl.principal(deployer)],
        deployer
      );
      
      expect(changeSuperAdmin.result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });
  });

  describe('School Functions - Issue Certificates', () => {
    
    beforeEach(() => {
      // Add school before each test in this suite
      simnet.callPublicFn(
        'academic-certificates',
        'add-school',
        [Cl.principal(wallet1), Cl.stringAscii('Oxford University')],
        deployer
      );
    });

    it('allows authorized school to issue certificate', () => {
      const issueCert = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [
          Cl.stringAscii('STUDENT-001'),
          Cl.stringAscii('Blockchain Development'),
          Cl.stringAscii('A+'),
          Cl.principal(wallet3),
        ],
        wallet1
      );
      
      expect(issueCert.result).toBeOk(Cl.uint(1)); // Certificate ID = 1
      
      // Verify certificate was created
      const cert = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-certificate',
        [Cl.uint(1)],
        deployer
      );
      
      expect(cert.result).toBeSome(
        Cl.tuple({
          'school-id': Cl.principal(wallet1),
          'student-id': Cl.stringAscii('STUDENT-001'),
          course: Cl.stringAscii('Blockchain Development'),
          grade: Cl.stringAscii('A+'),
          'student-wallet': Cl.principal(wallet3),
        })
      );
    });

    it('rejects certificate issuance from unauthorized school', () => {
      const issueCert = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [
          Cl.stringAscii('STUDENT-002'),
          Cl.stringAscii('Smart Contracts'),
          Cl.stringAscii('B'),
          Cl.principal(wallet3),
        ],
        wallet2 // Not authorized
      );
      
      expect(issueCert.result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it('rejects certificate issuance from deactivated school', () => {
      // Deactivate school
      simnet.callPublicFn(
        'academic-certificates',
        'deactivate-school',
        [Cl.principal(wallet1)],
        deployer
      );
      
      // Try to issue certificate
      const issueCert = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [
          Cl.stringAscii('STUDENT-003'),
          Cl.stringAscii('Web3 Security'),
          Cl.stringAscii('A'),
          Cl.principal(wallet3),
        ],
        wallet1
      );
      
      expect(issueCert.result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it('rejects certificate with empty student-id', () => {
      const issueCert = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [
          Cl.stringAscii(''),
          Cl.stringAscii('DeFi Course'),
          Cl.stringAscii('A'),
          Cl.principal(wallet3),
        ],
        wallet1
      );
      
      expect(issueCert.result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it('rejects certificate with empty course', () => {
      const issueCert = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [
          Cl.stringAscii('STUDENT-004'),
          Cl.stringAscii(''),
          Cl.stringAscii('B+'),
          Cl.principal(wallet3),
        ],
        wallet1
      );
      
      expect(issueCert.result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it('rejects certificate with empty grade', () => {
      const issueCert = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [
          Cl.stringAscii('STUDENT-005'),
          Cl.stringAscii('academic-certificates Basics'),
          Cl.stringAscii(''),
          Cl.principal(wallet3),
        ],
        wallet1
      );
      
      expect(issueCert.result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it('rejects certificate if student-wallet is super-admin', () => {
      const issueCert = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [
          Cl.stringAscii('STUDENT-006'),
          Cl.stringAscii('Advanced Clarity'),
          Cl.stringAscii('A'),
          Cl.principal(deployer), // Super-admin
        ],
        wallet1
      );
      
      expect(issueCert.result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it('rejects certificate if student-wallet is the issuing school', () => {
      const issueCert = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [
          Cl.stringAscii('STUDENT-007'),
          Cl.stringAscii('Self Course'),
          Cl.stringAscii('A'),
          Cl.principal(wallet1), // Same as issuer
        ],
        wallet1
      );
      
      expect(issueCert.result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it('allows school to issue multiple certificates', () => {
      // Issue first certificate
      const cert1 = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [
          Cl.stringAscii('STUDENT-008'),
          Cl.stringAscii('Course 1'),
          Cl.stringAscii('A'),
          Cl.principal(wallet3),
        ],
        wallet1
      );
      expect(cert1.result).toBeOk(Cl.uint(1));
      
      // Issue second certificate
      const cert2 = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [
          Cl.stringAscii('STUDENT-009'),
          Cl.stringAscii('Course 2'),
          Cl.stringAscii('B'),
          Cl.principal(wallet4),
        ],
        wallet1
      );
      expect(cert2.result).toBeOk(Cl.uint(2));
      
      // Issue third certificate
      const cert3 = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [
          Cl.stringAscii('STUDENT-010'),
          Cl.stringAscii('Course 3'),
          Cl.stringAscii('A-'),
          Cl.principal(wallet3),
        ],
        wallet1
      );
      expect(cert3.result).toBeOk(Cl.uint(3));
      
      // Verify total certificates
      const total = simnet.callReadOnlyFn('academic-certificates', 'get-total-certificates', [], deployer);
      expect(total.result).toBeUint(3);
    });
  });

  describe('Read-Only Functions', () => {
    
    beforeEach(() => {
      // Setup: Add school and issue some certificates
      simnet.callPublicFn(
        'academic-certificates',
        'add-school',
        [Cl.principal(wallet1), Cl.stringAscii('Cambridge University')],
        deployer
      );
      
      simnet.callPublicFn(
        'academic-certificates',
        'add-school',
        [Cl.principal(wallet2), Cl.stringAscii('ETH Zurich')],
        deployer
      );
    });

    it('retrieves certificate details correctly', () => {
      // Issue certificate
      simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [
          Cl.stringAscii('STU-123'),
          Cl.stringAscii('Cryptography 101'),
          Cl.stringAscii('A'),
          Cl.principal(wallet3),
        ],
        wallet1
      );
      
      // Get certificate
      const cert = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-certificate',
        [Cl.uint(1)],
        deployer
      );
      
      expect(cert.result).toBeSome(
        Cl.tuple({
          'school-id': Cl.principal(wallet1),
          'student-id': Cl.stringAscii('STU-123'),
          course: Cl.stringAscii('Cryptography 101'),
          grade: Cl.stringAscii('A'),
          'student-wallet': Cl.principal(wallet3),
        })
      );
    });

    it('returns none for non-existent certificate', () => {
      const cert = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-certificate',
        [Cl.uint(999)],
        deployer
      );
      
      expect(cert.result).toBeNone();
    });

    it('retrieves all certificates for a student', () => {
      // Issue multiple certificates to same student
      simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [
          Cl.stringAscii('STU-200'),
          Cl.stringAscii('Math 101'),
          Cl.stringAscii('A'),
          Cl.principal(wallet3),
        ],
        wallet1
      );
      
      simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [
          Cl.stringAscii('STU-200'),
          Cl.stringAscii('Physics 101'),
          Cl.stringAscii('B+'),
          Cl.principal(wallet3),
        ],
        wallet1
      );
      
      // Get student certificates
      const studentCerts = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-student-certificates',
        [Cl.principal(wallet3)],
        deployer
      );
      
      expect(studentCerts.result).toBeSome(
        Cl.tuple({
          'certificate-ids': Cl.list([Cl.uint(1), Cl.uint(2)]),
        })
      );
    });

    it('returns none for student with no certificates', () => {
      const studentCerts = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-student-certificates',
        [Cl.principal(wallet4)],
        deployer
      );
      
      expect(studentCerts.result).toBeNone();
    });

    it('retrieves all certificates issued by a school', () => {
      // School issues multiple certificates
      simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [
          Cl.stringAscii('STU-300'),
          Cl.stringAscii('Chemistry'),
          Cl.stringAscii('A'),
          Cl.principal(wallet3),
        ],
        wallet1
      );
      
      simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [
          Cl.stringAscii('STU-301'),
          Cl.stringAscii('Biology'),
          Cl.stringAscii('A-'),
          Cl.principal(wallet4),
        ],
        wallet1
      );
      
      // Get school certificates
      const schoolCerts = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-school-certificates',
        [Cl.principal(wallet1)],
        deployer
      );
      
      expect(schoolCerts.result).toBeSome(
        Cl.tuple({
          'certificate-ids': Cl.list([Cl.uint(1), Cl.uint(2)]),
        })
      );
    });

    it('returns none for school with no issued certificates', () => {
      const schoolCerts = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-school-certificates',
        [Cl.principal(wallet2)],
        deployer
      );
      
      expect(schoolCerts.result).toBeNone();
    });

    it('retrieves school information correctly', () => {
      const schoolInfo = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-school-info',
        [Cl.principal(wallet1)],
        deployer
      );
      
      expect(schoolInfo.result).toBeSome(
        Cl.tuple({
          'school-name': Cl.stringAscii('Cambridge University'),
          active: Cl.bool(true),
        })
      );
    });

    it('returns none for non-existent school', () => {
      const schoolInfo = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-school-info',
        [Cl.principal(wallet4)],
        deployer
      );
      
      expect(schoolInfo.result).toBeNone();
    });

    it('returns correct total certificates count', () => {
      const totalBefore = simnet.callReadOnlyFn('academic-certificates', 'get-total-certificates', [], deployer);
      expect(totalBefore.result).toBeUint(0);
      
      // Issue some certificates
      simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [Cl.stringAscii('S1'), Cl.stringAscii('C1'), Cl.stringAscii('A'), Cl.principal(wallet3)],
        wallet1
      );
      
      simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [Cl.stringAscii('S2'), Cl.stringAscii('C2'), Cl.stringAscii('B'), Cl.principal(wallet4)],
        wallet2
      );
      
      const totalAfter = simnet.callReadOnlyFn('academic-certificates', 'get-total-certificates', [], deployer);
      expect(totalAfter.result).toBeUint(2);
    });
  });

  describe('Edge Cases and Advanced Scenarios', () => {
    
    beforeEach(() => {
      // Setup schools
      simnet.callPublicFn(
        'academic-certificates',
        'add-school',
        [Cl.principal(wallet1), Cl.stringAscii('School A')],
        deployer
      );
      
      simnet.callPublicFn(
        'academic-certificates',
        'add-school',
        [Cl.principal(wallet2), Cl.stringAscii('School B')],
        deployer
      );
    });

    it('increments certificate counter correctly', () => {
      const cert1 = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [Cl.stringAscii('S1'), Cl.stringAscii('C1'), Cl.stringAscii('A'), Cl.principal(wallet3)],
        wallet1
      );
      expect(cert1.result).toBeOk(Cl.uint(1));
      
      const cert2 = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [Cl.stringAscii('S2'), Cl.stringAscii('C2'), Cl.stringAscii('B'), Cl.principal(wallet3)],
        wallet1
      );
      expect(cert2.result).toBeOk(Cl.uint(2));
      
      const cert3 = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [Cl.stringAscii('S3'), Cl.stringAscii('C3'), Cl.stringAscii('A'), Cl.principal(wallet4)],
        wallet2
      );
      expect(cert3.result).toBeOk(Cl.uint(3));
      
      const total = simnet.callReadOnlyFn('academic-certificates', 'get-total-certificates', [], deployer);
      expect(total.result).toBeUint(3);
    });

    it('handles multiple schools issuing certificates to same student', () => {
      // School 1 issues certificate
      const cert1 = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [Cl.stringAscii('S-MULTI'), Cl.stringAscii('Course A'), Cl.stringAscii('A'), Cl.principal(wallet3)],
        wallet1
      );
      expect(cert1.result).toBeOk(Cl.uint(1));
      
      // School 2 issues certificate to same student
      const cert2 = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [Cl.stringAscii('S-MULTI-2'), Cl.stringAscii('Course B'), Cl.stringAscii('B'), Cl.principal(wallet3)],
        wallet2
      );
      expect(cert2.result).toBeOk(Cl.uint(2));
      
      // Verify student has both certificates
      const studentCerts = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-student-certificates',
        [Cl.principal(wallet3)],
        deployer
      );
      
      expect(studentCerts.result).toBeSome(
        Cl.tuple({
          'certificate-ids': Cl.list([Cl.uint(1), Cl.uint(2)]),
        })
      );
      
      // Verify each school has their certificate
      const school1Certs = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-school-certificates',
        [Cl.principal(wallet1)],
        deployer
      );
      expect(school1Certs.result).toBeSome(
        Cl.tuple({
          'certificate-ids': Cl.list([Cl.uint(1)]),
        })
      );
      
      const school2Certs = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-school-certificates',
        [Cl.principal(wallet2)],
        deployer
      );
      expect(school2Certs.result).toBeSome(
        Cl.tuple({
          'certificate-ids': Cl.list([Cl.uint(2)]),
        })
      );
    });

    it('tracks certificates across multiple students per school', () => {
      // Issue certificates to different students from same school
      simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [Cl.stringAscii('S-1'), Cl.stringAscii('C1'), Cl.stringAscii('A'), Cl.principal(wallet3)],
        wallet1
      );
      
      simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [Cl.stringAscii('S-2'), Cl.stringAscii('C2'), Cl.stringAscii('B'), Cl.principal(wallet4)],
        wallet1
      );
      
      simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [Cl.stringAscii('S-3'), Cl.stringAscii('C3'), Cl.stringAscii('A+'), Cl.principal(wallet3)],
        wallet1
      );
      
      // Verify school has all 3 certificates
      const schoolCerts = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-school-certificates',
        [Cl.principal(wallet1)],
        deployer
      );
      
      expect(schoolCerts.result).toBeSome(
        Cl.tuple({
          'certificate-ids': Cl.list([Cl.uint(1), Cl.uint(2), Cl.uint(3)]),
        })
      );
      
      // Verify wallet3 has 2 certificates
      const student1Certs = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-student-certificates',
        [Cl.principal(wallet3)],
        deployer
      );
      
      expect(student1Certs.result).toBeSome(
        Cl.tuple({
          'certificate-ids': Cl.list([Cl.uint(1), Cl.uint(3)]),
        })
      );
      
      // Verify wallet4 has 1 certificate
      const student2Certs = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-student-certificates',
        [Cl.principal(wallet4)],
        deployer
      );
      
      expect(student2Certs.result).toBeSome(
        Cl.tuple({
          'certificate-ids': Cl.list([Cl.uint(2)]),
        })
      );
    });

    it('preserves data integrity after school deactivation', () => {
      // Issue certificate
      const certId = simnet.callPublicFn(
        'academic-certificates',
        'issue-certificate',
        [Cl.stringAscii('S-PRESERVE'), Cl.stringAscii('Course'), Cl.stringAscii('A'), Cl.principal(wallet3)],
        wallet1
      );
      expect(certId.result).toBeOk(Cl.uint(1));
      
      // Deactivate school
      simnet.callPublicFn(
        'academic-certificates',
        'deactivate-school',
        [Cl.principal(wallet1)],
        deployer
      );
      
      // Certificate should still exist
      const cert = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-certificate',
        [Cl.uint(1)],
        deployer
      );
      
      expect(cert.result).toBeSome(
        Cl.tuple({
          'school-id': Cl.principal(wallet1),
          'student-id': Cl.stringAscii('S-PRESERVE'),
          course: Cl.stringAscii('Course'),
          grade: Cl.stringAscii('A'),
          'student-wallet': Cl.principal(wallet3),
        })
      );
      
      // Student should still have certificate
      const studentCerts = simnet.callReadOnlyFn(
        'academic-certificates',
        'get-student-certificates',
        [Cl.principal(wallet3)],
        deployer
      );
      
      expect(studentCerts.result).toBeSome(
        Cl.tuple({
          'certificate-ids': Cl.list([Cl.uint(1)]),
        })
      );
    });
  });
});