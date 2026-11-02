/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TabsNav } from './components/TabsNav';
import { DashboardView } from './components/DashboardView';
import { AbsensiUmumView } from './components/AbsensiUmumView';
import { AbsensiSubBidangView } from './components/AbsensiSubBidangView';
import { TimbanganSampahView } from './components/TimbanganSampahView';
import { ProdukHasilView } from './components/ProdukHasilView';
import { AdminPanelView } from './components/AdminPanelView';
import { AppsScriptHubView } from './components/AppsScriptHubView';
import { AdminLoginModal, EditRecordModal, AdminNoteModal } from './components/Modals';
import {
  ActiveTab,
  MasterPegawai,
  AbsensiUmumRecord,
  AbsensiSubBidangRecord,
  TimbanganSampahRecord,
  ProdukHasilRecord
} from './types';
import { DataService } from './services/dataService';
import { ADMIN_PASSWORD, formatDate } from './utils/adiwiyataLogic';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [useLiveApi, setUseLiveApi] = useState<boolean>(DataService.isLiveApiEnabled());
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));

  // Data States
  const [masterPegawai, setMasterPegawai] = useState<MasterPegawai[]>([]);
  const [absensiUmum, setAbsensiUmum] = useState<AbsensiUmumRecord[]>([]);
  const [absensiSub, setAbsensiSub] = useState<AbsensiSubBidangRecord[]>([]);
  const [timbangan, setTimbangan] = useState<TimbanganSampahRecord[]>([]);
  const [produk, setProduk] = useState<ProdukHasilRecord[]>([]);

  // Modals
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [editModalState, setEditModalState] = useState<{
    isOpen: boolean;
    sheetName: any;
    record: any;
  }>({
    isOpen: false,
    sheetName: 'Absensi_Umum',
    record: null
  });
  const [adminNoteModalState, setAdminNoteModalState] = useState<{
    isOpen: boolean;
    sheetName: any;
    recordId: string;
    currentNote: string;
  }>({
    isOpen: false,
    sheetName: 'Absensi_Umum',
    recordId: '',
    currentNote: ''
  });

  // Reload data from storage
  const loadAllData = () => {
    setMasterPegawai(DataService.getMasterPegawai());
    setAbsensiUmum(DataService.getAbsensiUmum());
    setAbsensiSub(DataService.getAbsensiSub());
    setTimbangan(DataService.getTimbangan());
    setProduk(DataService.getProduk());
  };

  useEffect(() => {
    loadAllData();
    // Otomatis sinkronisasi data dari Google Sheets Spreadsheet
    DataService.syncFromRemote().then(res => {
      if (res.success) {
        loadAllData();
      }
    });
  }, []);


  // --- Handlers for Creation ---
  const handleAddAbsensiUmum = (data: {
    namaPegawai: string;
    statusKehadiran: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
    catatan: string;
    date: string;
  }) => {
    DataService.createAbsensiUmum(data);
    loadAllData();
  };

  const handleAddAbsensiSub = (data: {
    namaPegawai: string;
    bidang: 'Pengumpulan Sampah Botol' | 'Plastik Halus' | 'Organik';
    status: string;
    catatan: string;
    date: string;
  }) => {
    DataService.createAbsensiSub(data);
    loadAllData();
  };

  const handleAddTimbangan = (data: {
    jenisSampah: 'Botol' | 'Plastik Halus' | 'Organik' | string;
    beratKg: number;
    petugas: string;
    catatan: string;
    date: string;
  }) => {
    DataService.createTimbangan(data);
    loadAllData();
  };

  const handleAddProduk = (data: {
    jenisProduk: 'Air lindi' | 'Pupuk Kompos' | 'Barang Daur Ulang' | string;
    satuan: 'Liter' | 'Kilogram' | 'Jumlah Barang' | string;
    jumlah: number;
    petugas: string;
    catatan: string;
    date: string;
  }) => {
    DataService.createProduk(data);
    loadAllData();
  };

  // --- Admin Handlers ---
  const handleManagePegawai = (subAction: 'add' | 'edit' | 'delete', payload: any) => {
    DataService.managePegawai(subAction, payload);
    loadAllData();
  };

  const handleSaveEditRecord = (
    sheetName: any,
    recordId: string,
    updatedFields: Record<string, any>
  ) => {
    DataService.updateRecord(sheetName, recordId, updatedFields, ADMIN_PASSWORD);
    loadAllData();
  };

  const handleDeleteRecord = (sheetName: any, recordId: string) => {
    DataService.deleteRecord(sheetName, recordId, ADMIN_PASSWORD);
    loadAllData();
  };

  const handleSaveAdminNote = (sheetName: any, recordId: string, note: string) => {
    DataService.updateAdminNote(sheetName, recordId, note, ADMIN_PASSWORD);
    loadAllData();
  };

  const handleResetDefaults = () => {
    DataService.resetToDefaults();
    loadAllData();
  };

  const handleToggleLiveApi = (enabled: boolean) => {
    DataService.setLiveApiEnabled(enabled);
    setUseLiveApi(enabled);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-200">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onAdminLogout={() => setIsAdmin(false)}
        onOpenAdminLogin={() => setLoginModalOpen(true)}
        useLiveApi={useLiveApi}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Tabs Navigation */}
      <TabsNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            absensiUmum={absensiUmum}
            absensiSub={absensiSub}
            timbangan={timbangan}
            produk={produk}
            setActiveTab={setActiveTab}
            onRefresh={loadAllData}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        )}

        {activeTab === 'absensi-umum' && (
          <AbsensiUmumView
            records={absensiUmum}
            masterPegawai={masterPegawai}
            isAdmin={isAdmin}
            onAddRecord={handleAddAbsensiUmum}
            onEditRecord={r =>
              setEditModalState({ isOpen: true, sheetName: 'Absensi_Umum', record: r })
            }
            onDeleteRecord={id => handleDeleteRecord('Absensi_Umum', id)}
            onAddAdminNote={(id, note) =>
              setAdminNoteModalState({
                isOpen: true,
                sheetName: 'Absensi_Umum',
                recordId: id,
                currentNote: note
              })
            }
          />
        )}

        {activeTab === 'absensi-sub' && (
          <AbsensiSubBidangView
            records={absensiSub}
            masterPegawai={masterPegawai}
            isAdmin={isAdmin}
            onAddRecord={handleAddAbsensiSub}
            onEditRecord={r =>
              setEditModalState({ isOpen: true, sheetName: 'Absensi_SubBidang', record: r })
            }
            onDeleteRecord={id => handleDeleteRecord('Absensi_SubBidang', id)}
            onAddAdminNote={(id, note) =>
              setAdminNoteModalState({
                isOpen: true,
                sheetName: 'Absensi_SubBidang',
                recordId: id,
                currentNote: note
              })
            }
          />
        )}

        {activeTab === 'timbangan' && (
          <TimbanganSampahView
            records={timbangan}
            masterPegawai={masterPegawai}
            isAdmin={isAdmin}
            onAddRecord={handleAddTimbangan}
            onEditRecord={r =>
              setEditModalState({ isOpen: true, sheetName: 'Timbangan_Sampah', record: r })
            }
            onDeleteRecord={id => handleDeleteRecord('Timbangan_Sampah', id)}
            onAddAdminNote={(id, note) =>
              setAdminNoteModalState({
                isOpen: true,
                sheetName: 'Timbangan_Sampah',
                recordId: id,
                currentNote: note
              })
            }
          />
        )}

        {activeTab === 'produk' && (
          <ProdukHasilView
            records={produk}
            masterPegawai={masterPegawai}
            isAdmin={isAdmin}
            onAddRecord={handleAddProduk}
            onEditRecord={r =>
              setEditModalState({ isOpen: true, sheetName: 'Produk_Hasil', record: r })
            }
            onDeleteRecord={id => handleDeleteRecord('Produk_Hasil', id)}
            onAddAdminNote={(id, note) =>
              setAdminNoteModalState({
                isOpen: true,
                sheetName: 'Produk_Hasil',
                recordId: id,
                currentNote: note
              })
            }
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanelView
            isAdmin={isAdmin}
            onLoginSuccess={() => setIsAdmin(true)}
            onLogout={() => setIsAdmin(false)}
            masterPegawai={masterPegawai}
            absensiUmum={absensiUmum}
            absensiSub={absensiSub}
            timbangan={timbangan}
            produk={produk}
            onManagePegawai={handleManagePegawai}
            onEditRecord={(sheet, rec) =>
              setEditModalState({ isOpen: true, sheetName: sheet, record: rec })
            }
            onDeleteRecord={(sheet, id) => handleDeleteRecord(sheet, id)}
            onAddAdminNote={(sheet, id, note) =>
              setAdminNoteModalState({
                isOpen: true,
                sheetName: sheet,
                recordId: id,
                currentNote: note
              })
            }
            onResetDefaults={handleResetDefaults}
          />
        )}

        {activeTab === 'script-hub' && (
          <AppsScriptHubView
            useLiveApi={useLiveApi}
            onToggleLiveApi={handleToggleLiveApi}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>SMAN 27 GARUT</strong> • Divisi Pengelolaan Sampah Adiwiyata Mandiri
          </div>
          <div className="flex items-center gap-3">
            <span>Password Admin: <code className="bg-slate-100 font-mono text-emerald-800 font-semibold px-1 rounded">dead4left</code></span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('script-hub')}
              className="text-emerald-700 hover:underline font-semibold"
            >
              Unduh Code.gs
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => {
          setIsAdmin(true);
          setActiveTab('admin');
        }}
      />

      <EditRecordModal
        isOpen={editModalState.isOpen}
        onClose={() => setEditModalState({ isOpen: false, sheetName: 'Absensi_Umum', record: null })}
        record={editModalState.record}
        sheetName={editModalState.sheetName}
        onSave={handleSaveEditRecord}
        masterPegawai={masterPegawai}
      />

      <AdminNoteModal
        isOpen={adminNoteModalState.isOpen}
        onClose={() =>
          setAdminNoteModalState({
            isOpen: false,
            sheetName: 'Absensi_Umum',
            recordId: '',
            currentNote: ''
          })
        }
        recordId={adminNoteModalState.recordId}
        sheetName={adminNoteModalState.sheetName}
        currentNote={adminNoteModalState.currentNote}
        onSave={handleSaveAdminNote}
      />
    </div>
  );
}
