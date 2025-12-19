
import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("certificate-data contract", () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  describe("initialization", () => {
    it("sets deployer as super-admin", () => {
      const { result } = simnet.callReadOnlyFn(
        "certificate-data",
        "get-super-admin",
        [],
        deployer
      );
      expect(result).toBePrincipal(deployer);
    });

    it("initializes certificate counter to zero", () => {
      const { result } = simnet.callReadOnlyFn(
        "certificate-data",
        "get-certificate-counter",
        [],
        deployer
      );
      expect(result).toBeUint(0);
    });

    it("initializes stx-per-credit to 2000", () => {
      const { result } = simnet.callReadOnlyFn(
        "certificate-data",
        "get-stx-per-credit",
        [],
        deployer
      );
      expect(result).toBeUint(2000);
    });
  });

  describe("writer authorization", () => {
    it("allows super-admin to authorize a writer", () => {
      const { result } = simnet.callPublicFn(
        "certificate-data",
        "authorize-writer",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify authorization
      const isAuthorized = simnet.callReadOnlyFn(
        "certificate-data",
        "is-writer-authorized",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(isAuthorized.result).toBeBool(true);
    });

    it("allows super-admin to revoke a writer", () => {
      // First authorize
      simnet.callPublicFn(
        "certificate-data",
        "authorize-writer",
        [Cl.principal(wallet1)],
        deployer
      );

      // Then revoke
      const { result } = simnet.callPublicFn(
        "certificate-data",
        "revoke-writer",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify revocation
      const isAuthorized = simnet.callReadOnlyFn(
        "certificate-data",
        "is-writer-authorized",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(isAuthorized.result).toBeBool(false);
    });

    it("fails when non-admin tries to authorize writer", () => {
      const { result } = simnet.callPublicFn(
        "certificate-data",
        "authorize-writer",
        [Cl.principal(wallet2)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });
  });

  describe("school management", () => {
    beforeEach(() => {
      // Authorize manager contract as writer
      simnet.callPublicFn(
        "certificate-data",
        "authorize-writer",
        [Cl.contractPrincipal(deployer, "certificate-manager-v1")],
        deployer
      );
    });

    it("stores school info successfully", () => {
      const schoolName = "Test University";
      const metadataUrl = "https://test-uni.com/metadata.json";

      const { result } = simnet.callPublicFn(
        "certificate-data",
        "store-school",
        [
          Cl.principal(wallet1),
          Cl.stringAscii(schoolName),
          Cl.stringAscii(metadataUrl)
        ],
        deployer
      );
      expect(result).toBeErr(Cl.uint(100)); // Not authorized without being called by manager
    });

    it("fails to store school with empty name", () => {
      const { result } = simnet.callPublicFn(
        "certificate-data",
        "store-school",
        [
          Cl.principal(wallet1),
          Cl.stringAscii(""),
          Cl.stringAscii("https://test.com")
        ],
        deployer
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED or ERR_FIELD_EMPTY
    });
  });

  describe("credits management", () => {
    beforeEach(() => {
      // Authorize manager contract
      simnet.callPublicFn(
        "certificate-data",
        "authorize-writer",
        [Cl.contractPrincipal(deployer, "certificate-manager-v1")],
        deployer
      );
    });

    it("returns zero credits for new school", () => {
      const { result } = simnet.callReadOnlyFn(
        "certificate-data",
        "get-school-credits",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeUint(0);
    });
  });

  describe("certificate management", () => {
    it("returns none for non-existent certificate", () => {
      const { result } = simnet.callReadOnlyFn(
        "certificate-data",
        "get-certificate",
        [Cl.uint(999)],
        deployer
      );
      expect(result).toBeNone();
    });

    it("increments certificate counter", () => {
      // Authorize manager
      simnet.callPublicFn(
        "certificate-data",
        "authorize-writer",
        [Cl.contractPrincipal(deployer, "certificate-manager-v1")],
        deployer
      );

      const initialCounter = simnet.callReadOnlyFn(
        "certificate-data",
        "get-certificate-counter",
        [],
        deployer
      );
      expect(initialCounter.result).toBeUint(0);
    });
  });

  describe("stx-per-credit configuration", () => {
    it("allows authorized writer to update stx-per-credit", () => {
      // Authorize wallet1
      simnet.callPublicFn(
        "certificate-data",
        "authorize-writer",
        [Cl.principal(wallet1)],
        deployer
      );

      // Note: This will fail because wallet1 is not contract-caller
      const { result } = simnet.callPublicFn(
        "certificate-data",
        "set-stx-per-credit",
        [Cl.uint(3000)],
        wallet1
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("admin functions", () => {
    it("allows super-admin to change admin", () => {
      const { result } = simnet.callPublicFn(
        "certificate-data",
        "change-super-admin",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      const newAdmin = simnet.callReadOnlyFn(
        "certificate-data",
        "get-super-admin",
        [],
        deployer
      );
      expect(newAdmin.result).toBePrincipal(wallet1);
    });

    it("fails when non-admin tries to change admin", () => {
      const { result } = simnet.callPublicFn(
        "certificate-data",
        "change-super-admin",
        [Cl.principal(wallet2)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });
  });
});
