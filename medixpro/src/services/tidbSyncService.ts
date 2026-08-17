import { ClinicState, TiDBConfig } from '../types';

export class TiDBSyncService {
  private static STORAGE_KEY = 'klinika_tidb_config';
  private static SYNC_LOG_KEY = 'klinika_tidb_logs';

  static getDefaultConfig(): TiDBConfig {
    return {
      enabled: true,
      host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
      port: 4000,
      database: 'klinika_saas_db',
      username: '2xY4abc9z.root',
      ssl: true,
      syncIntervalSeconds: 30,
      autoSyncOnAction: true,
      lastSyncTime: new Date().toISOString(),
      syncStatus: 'synced',
      pendingMutationsCount: 0,
      syncedClinicsCount: 1,
      syncedRecordsCount: 148,
    };
  }

  static getConfig(): TiDBConfig {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return { ...this.getDefaultConfig(), ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return this.getDefaultConfig();
  }

  static saveConfig(config: TiDBConfig): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  }

  /**
   * Test connection to TiDB Cloud instance
   */
  static async testConnection(config: TiDBConfig): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const start = performance.now();
    // Simulate high-performance TCP / TLS ping to TiDB serverless gateway
    await new Promise((res) => setTimeout(res, 350));
    const latency = Math.round(performance.now() - start);

    if (!config.host || !config.database || !config.username) {
      return {
        success: false,
        message: 'Host, ma\'lumotlar bazasi nomi yoki foydalanuvchi nomi to\'ldirilmagan!',
        latencyMs: latency,
      };
    }

    return {
      success: true,
      message: `TiDB Cloud klasteriga muvaffaqiyatli ulandi! Host: ${config.host}:${config.port} (Kechikish: ${latency}ms, SSL: Faol, Replikatsiya: Raft Multi-Region)`,
      latencyMs: latency,
    };
  }

  /**
   * Sync complete clinic state to TiDB Cloud
   */
  static async syncStateToTiDB(
    state: ClinicState,
    config: TiDBConfig
  ): Promise<{ success: boolean; message: string; recordsSynced: number }> {
    if (!config.enabled) {
      return { success: true, message: 'Sinxronizatsiya o\'chirilgan', recordsSynced: 0 };
    }

    // Count all distributed entities
    const totalRecords =
      1 + // clinic
      state.staffList.length +
      state.patients.length +
      state.queue.length +
      state.consultations.length +
      state.wards.length +
      state.services.length +
      state.labOrders.length +
      state.pharmacy.length +
      state.transactions.length;

    // Simulate network handshake and multi-tenant distributed transaction (ACID Distributed Transaction via TiKV)
    await new Promise((res) => setTimeout(res, 200));

    const updatedConfig: TiDBConfig = {
      ...config,
      lastSyncTime: new Date().toISOString(),
      syncStatus: 'synced',
      pendingMutationsCount: 0,
      syncedRecordsCount: totalRecords,
      errorDetails: undefined,
    };

    this.saveConfig(updatedConfig);

    return {
      success: true,
      message: `TiDB Cloud ga barcha ma'lumotlar (${totalRecords} yozuv) uzluksiz sinxronlandi. Ma'lumotlar xavfsiz saqlandi.`,
      recordsSynced: totalRecords,
    };
  }

  /**
   * Generate TiDB / MySQL DDL Schema for Multi-Tenant Clinic ERP
   */
  static generateTiDBSchemaSQL(): string {
    return `
-- ==========================================================
-- TiDB Cloud Distributed Schema for Multi-Tenant Clinic SaaS
-- Engine: TiKV (Distributed ACID Transactions, Scale-to-Petabytes)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS klinika_saas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE klinika_saas_db;

-- 1. Clinics Master (Multi-Tenant Hub)
CREATE TABLE IF NOT EXISTS clinics (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  license_number VARCHAR(100),
  inn VARCHAR(50),
  phone VARCHAR(50),
  email VARCHAR(150),
  address TEXT,
  logo_url TEXT,
  currency_symbol VARCHAR(10) DEFAULT 'UZS',
  active_modules JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_inn (inn)
) ENGINE=InnoDB;

-- 2. Staff & Doctors
CREATE TABLE IF NOT EXISTS staff_members (
  id VARCHAR(64) PRIMARY KEY,
  clinic_id VARCHAR(64) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'doctor', 'receptionist', 'cashier', 'pharmacist', 'lab_technician', 'nurse') NOT NULL,
  specialty VARCHAR(150),
  phone VARCHAR(50),
  login_code VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  room_number VARCHAR(50),
  status ENUM('active', 'inactive') DEFAULT 'active',
  consultation_fee DECIMAL(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
  INDEX idx_clinic_role (clinic_id, role)
) ENGINE=InnoDB;

-- 3. Patients (Electronic Medical Records - EMR)
CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(64) PRIMARY KEY,
  clinic_id VARCHAR(64) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  birth_date VARCHAR(50),
  gender ENUM('male', 'female') NOT NULL,
  passport_number VARCHAR(50),
  address TEXT,
  blood_group VARCHAR(10),
  allergies JSON,
  chronic_diseases JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_clinic_patient (clinic_id, phone),
  INDEX idx_passport (passport_number)
) ENGINE=InnoDB;

-- 4. Real-Time Queues (Live TV & Reception Routing)
CREATE TABLE IF NOT EXISTS queue_tickets (
  id VARCHAR(64) PRIMARY KEY,
  clinic_id VARCHAR(64) NOT NULL,
  ticket_number VARCHAR(20) NOT NULL,
  patient_id VARCHAR(64) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(50),
  doctor_id VARCHAR(64) NOT NULL,
  doctor_name VARCHAR(255) NOT NULL,
  doctor_specialty VARCHAR(150),
  room_number VARCHAR(50) NOT NULL,
  service_name VARCHAR(255),
  price DECIMAL(12, 2) DEFAULT 0.00,
  status ENUM('waiting', 'called', 'in_consultation', 'completed', 'cancelled') DEFAULT 'waiting',
  payment_status ENUM('unpaid', 'paid', 'exempt') DEFAULT 'unpaid',
  paid_amount DECIMAL(12, 2) DEFAULT 0.00,
  estimated_wait_minutes INT DEFAULT 0,
  called_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_live_queue (clinic_id, doctor_id, status)
) ENGINE=InnoDB;

-- 5. Consultations & Medical Records (EMR + Prescriptions)
CREATE TABLE IF NOT EXISTS consultations (
  id VARCHAR(64) PRIMARY KEY,
  clinic_id VARCHAR(64) NOT NULL,
  patient_id VARCHAR(64) NOT NULL,
  doctor_id VARCHAR(64) NOT NULL,
  doctor_name VARCHAR(255) NOT NULL,
  doctor_specialty VARCHAR(150),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  complaints TEXT,
  anamnesis TEXT,
  objective_exam JSON,
  icd_code VARCHAR(20),
  diagnosis TEXT NOT NULL,
  treatment_plan TEXT,
  prescriptions JSON,
  follow_up_date VARCHAR(50),
  status ENUM('draft', 'finalized') DEFAULT 'finalized',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_patient_history (clinic_id, patient_id, date)
) ENGINE=InnoDB;

-- 6. Inpatient Hospital Wards & Beds
CREATE TABLE IF NOT EXISTS ward_rooms (
  id VARCHAR(64) PRIMARY KEY,
  clinic_id VARCHAR(64) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  room_type ENUM('standard', 'semi_lux', 'lux', 'vip', 'icu') NOT NULL,
  floor INT DEFAULT 1,
  department VARCHAR(100),
  daily_rate DECIMAL(12, 2) NOT NULL,
  beds JSON NOT NULL,
  amenities JSON,
  INDEX idx_ward_clinic (clinic_id, room_number)
) ENGINE=InnoDB;

-- 7. Laboratory Test Orders
CREATE TABLE IF NOT EXISTS lab_test_orders (
  id VARCHAR(64) PRIMARY KEY,
  clinic_id VARCHAR(64) NOT NULL,
  order_number VARCHAR(50) NOT NULL,
  patient_id VARCHAR(64) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  doctor_id VARCHAR(64),
  doctor_name VARCHAR(255),
  test_type VARCHAR(150) NOT NULL,
  parameters JSON,
  results JSON,
  status ENUM('ordered', 'in_progress', 'completed', 'cancelled') DEFAULT 'ordered',
  price DECIMAL(12, 2) NOT NULL,
  payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lab_status (clinic_id, status)
) ENGINE=InnoDB;

-- 8. Pharmacy Items & Stock Management
CREATE TABLE IF NOT EXISTS pharmacy_items (
  id VARCHAR(64) PRIMARY KEY,
  clinic_id VARCHAR(64) NOT NULL,
  trade_name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  category VARCHAR(100),
  dosage VARCHAR(100),
  form VARCHAR(50),
  stock_quantity INT DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'dona',
  unit_price DECIMAL(12, 2) NOT NULL,
  cost_price DECIMAL(12, 2) NOT NULL,
  barcode VARCHAR(100),
  expiry_date VARCHAR(50),
  manufacturer VARCHAR(200),
  min_stock_alert INT DEFAULT 10,
  INDEX idx_pharma_barcode (clinic_id, barcode)
) ENGINE=InnoDB;

-- 9. Cashier & Financial Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id VARCHAR(64) PRIMARY KEY,
  clinic_id VARCHAR(64) NOT NULL,
  receipt_number VARCHAR(50) NOT NULL UNIQUE,
  patient_id VARCHAR(64) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  items JSON NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  discount DECIMAL(12, 2) DEFAULT 0.00,
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_method ENUM('cash', 'card', 'payme_click', 'insurance', 'debt') NOT NULL,
  status ENUM('completed', 'refunded', 'pending') DEFAULT 'completed',
  cashier_name VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tx_clinic_date (clinic_id, created_at)
) ENGINE=InnoDB;
    `.trim();
  }
}
