import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { Users as UsersIcon, UserPlus, X, Calendar, MapPin, Briefcase, Phone, Mail, Lock, User, Hash, Home, Heart, GraduationCap, Droplet, Shield, Edit, Trash2, Eye, Search, Filter as FilterIcon, RotateCcw, UserCheck, UserCog, ChevronLeft, ChevronRight, List, Grid3x3 } from 'lucide-react';
import api from '../../services/api';

const Users = () => {
  const { toast, hideToast, success, error } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(5); // Changed to 5
  const [viewAll, setViewAll] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5, // Changed to 5
    total: 0,
    totalPages: 0
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    super_admin: 0,
    admin: 0,
    verifikator: 0,
    warga: 0,
    aktif: 0,
    nonaktif: 0
  });

  useEffect(() => {
    loadUsers();
  }, [currentPage, currentLimit, search, filterRole, filterStatus]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: viewAll ? 999999 : currentLimit
      };
      if (search) params.search = search;
      if (filterRole) params.role = filterRole;
      if (filterStatus) params.status = filterStatus;

      const response = await api.get('/admin/users', { params });
      setUsers(response.data.data || []);
      
      // Set pagination info
      setPagination({
        page: currentPage,
        limit: currentLimit,
        total: response.data.total || response.data.data?.length || 0,
        totalPages: response.data.totalPages || Math.ceil((response.data.total || 0) / currentLimit)
      });
    } catch (err) {
      console.error('Error loading users:', err);
      error('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/users/stats');
      setStats(response.data.data || stats);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilterRole('');
    setFilterStatus('');
    setCurrentPage(1);
    setViewAll(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setViewAll(false);
  };

  const handleLimitChange = (limit) => {
    setCurrentLimit(limit);
    setCurrentPage(1);
    setViewAll(false);
  };

  const handleViewAll = () => {
    setViewAll(true);
    setCurrentPage(1);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-gradient-to-r from-slate-700 to-slate-900 text-white';
      case 'admin': return 'bg-gradient-to-r from-blue-800 to-blue-950 text-white';
      case 'verifikator': return 'bg-gradient-to-r from-green-600 to-green-700 text-white';
      case 'warga': return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin': return <Shield className="w-4 h-4" />;
      case 'admin': return <UserCog className="w-4 h-4" />;
      case 'verifikator': return <UserCheck className="w-4 h-4" />;
      case 'warga': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin Desa';
      case 'verifikator': return 'Verifikator RT/RW';
      case 'warga': return 'Warga';
      default: return role;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-blue-900 rounded-xl flex items-center justify-center shadow-lg">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              Manajemen User
            </h1>
            <p className="text-gray-600 mt-2 ml-13">Kelola semua pengguna sistem</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <UserPlus className="w-5 h-5" />
            <span>Tambah User</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <UsersIcon className="w-5 h-5" />
              <p className="text-sm font-medium opacity-90">Total User</p>
            </div>
            <p className="text-3xl font-bold">{stats.total.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-slate-600 to-slate-800 text-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5" />
              <p className="text-sm font-medium opacity-90">Super Admin</p>
            </div>
            <p className="text-3xl font-bold">{stats.super_admin}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-800 to-blue-950 text-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <UserCog className="w-5 h-5" />
              <p className="text-sm font-medium opacity-90">Admin Desa</p>
            </div>
            <p className="text-3xl font-bold">{stats.admin}</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-5 h-5" />
              <p className="text-sm font-medium opacity-90">Verifikator RT/RW</p>
            </div>
            <p className="text-3xl font-bold">{stats.verifikator}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5" />
              <p className="text-sm font-medium opacity-90">Warga</p>
            </div>
            <p className="text-3xl font-bold">{stats.warga.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-5 h-5" />
              <p className="text-sm font-medium opacity-90">Aktif</p>
            </div>
            <p className="text-3xl font-bold">{stats.aktif.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <X className="w-5 h-5" />
              <p className="text-sm font-medium opacity-90">Nonaktif</p>
            </div>
            <p className="text-3xl font-bold">{stats.nonaktif.toLocaleString()}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama, NIK, atau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-300 focus:border-slate-700 transition"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-6 h-12 rounded-xl font-medium transition-all ${
                showFilters 
                  ? 'bg-slate-700 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FilterIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Filter</span>
            </button>

            {/* Reset */}
            {(search || filterRole || filterStatus) && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-6 h-12 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>

          {/* Filters Dropdown */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full h-11 px-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-300 focus:border-slate-700"
                >
                  <option value="">Semua Role</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin Desa</option>
                  <option value="verifikator">Verifikator RT/RW</option>
                  <option value="warga">Warga</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-11 px-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-300 focus:border-slate-700"
                >
                  <option value="">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="text-gray-600 mt-4">Memuat data user...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Tidak ada data user</p>
              <p className="text-sm text-gray-500 mt-1">Coba ubah filter pencarian</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">NIK</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Nama</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Role</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">RT/RW</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="py-4 px-6 text-sm text-gray-900 font-mono">{user.nik}</td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{user.nama}</div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{user.email}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {user.rt && user.rw ? `${user.rt}/${user.rw}` : '-'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            user.status === 'aktif' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {user.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDetailModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditModal(true);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowResetPasswordModal(true);
                              }}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                              title="Reset Password"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                            {user.role !== 'super_admin' && (
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden p-4 space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.nama}</p>
                        <p className="text-sm text-gray-600 font-mono mt-1">{user.nik}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {getRoleLabel(user.role)}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Email:</span> {user.email}
                      </p>
                      {user.rt && user.rw && (
                        <p className="text-gray-600">
                          <span className="font-medium">RT/RW:</span> {user.rt}/{user.rw}
                        </p>
                      )}
                      <p className="text-gray-600">
                        <span className="font-medium">Status:</span>{' '}
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'aktif' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {user.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetailModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                      >
                        <Eye className="w-4 h-4" />
                        Detail
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowResetPasswordModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition"
                      >
                        <Lock className="w-4 h-4" />
                        Reset
                      </button>
                      {user.role !== 'super_admin' && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination - Ultra Modern Design */}
          {!loading && users.length > 0 && (
            <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-5">
                {/* Left Side: Info & Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  {pagination.total > 0 && !viewAll && (
                    <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg border border-purple-100">
                      <List className="w-4 h-4 text-purple-600" />
                      <p className="text-sm text-gray-700 whitespace-nowrap">
                        <span className="font-bold text-purple-600">{(currentPage - 1) * currentLimit + 1}</span> - <span className="font-bold text-purple-600">{Math.min(currentPage * currentLimit, pagination.total)}</span> dari <span className="font-bold text-purple-600">{pagination.total?.toLocaleString()}</span> user
                      </p>
                    </div>
                  )}

                  {viewAll && (
                    <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                      <Grid3x3 className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-semibold text-green-700">
                        Menampilkan Semua ({pagination.total?.toLocaleString()} user)
                      </p>
                    </div>
                  )}

                  {!viewAll && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Per halaman:</label>
                      <select
                        value={currentLimit}
                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                        className="h-9 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  )}

                  {!viewAll && pagination.total > currentLimit && (
                    <button
                      onClick={handleViewAll}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-800 to-blue-900 text-white text-sm font-medium rounded-lg hover:from-blue-900 hover:to-blue-950 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <Grid3x3 className="w-4 h-4" />
                      Lihat Semua
                    </button>
                  )}

                  {viewAll && (
                    <button
                      onClick={() => {
                        setViewAll(false);
                        setCurrentPage(1);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white text-sm font-medium rounded-lg hover:from-slate-800 hover:to-slate-900 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <List className="w-4 h-4" />
                      Tampilan Normal
                    </button>
                  )}
                </div>

                {/* Right Side: Pagination Navigation */}
                {!viewAll && pagination.totalPages > 1 && (
                  <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl p-1.5 shadow-md">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2.5 rounded-lg transition-all duration-200 ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:scale-110'
                      }`}
                      title="Halaman Sebelumnya"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const pages = [];
                        const totalPages = pagination.totalPages;
                        const current = currentPage;

                        if (totalPages <= 7) {
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          if (current <= 4) {
                            pages.push(1, 2, 3, 4, 5, '...', totalPages);
                          } else if (current >= totalPages - 3) {
                            pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                          } else {
                            pages.push(1, '...', current - 1, current, current + 1, '...', totalPages);
                          }
                        }

                        return pages.map((page, index) => {
                          if (page === '...') {
                            return (
                              <span key={`ellipsis-${index}`} className="px-2 text-gray-400 font-bold text-lg">
                                •••
                              </span>
                            );
                          }

                          const isActive = page === current;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`min-w-[40px] h-10 px-3 rounded-lg font-semibold transition-all duration-200 ${
                                isActive
                                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg scale-110 ring-2 ring-slate-300'
                                  : 'text-gray-700 hover:bg-slate-50 hover:text-slate-700 hover:scale-105'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        });
                      })()}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className={`p-2.5 rounded-lg transition-all duration-200 ${
                        currentPage === pagination.totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:scale-110'
                      }`}
                      title="Halaman Berikutnya"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <AddUserModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              loadUsers();
              loadStats();
            }}
            showToast={success}
            showError={error}
          />
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedUser(null);
              loadUsers();
              loadStats();
            }}
            showToast={success}
            showError={error}
          />
        )}

        {/* Delete User Modal */}
        {showDeleteModal && selectedUser && (
          <DeleteUserModal
            user={selectedUser}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedUser(null);
            }}
            onSuccess={() => {
              setShowDeleteModal(false);
              setSelectedUser(null);
              loadUsers();
              loadStats();
            }}
            showToast={success}
            showError={error}
          />
        )}

        {/* Detail User Modal */}
        {showDetailModal && selectedUser && (
          <DetailUserModal
            user={selectedUser}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedUser(null);
            }}
          />
        )}

        {/* Reset Password Modal */}
        {showResetPasswordModal && selectedUser && (
          <ResetPasswordModal
            user={selectedUser}
            onClose={() => {
              setShowResetPasswordModal(false);
              setSelectedUser(null);
            }}
            onSuccess={() => {
              setShowResetPasswordModal(false);
              setSelectedUser(null);
            }}
            showToast={success}
            showError={error}
          />
        )}

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
            duration={toast.duration}
          />
        )}
      </div>
    </Layout>
  );
};

// Add User Modal Component
function AddUserModal({ onClose, onSuccess, showToast, showError }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    email: '',
    password: '',
    role: 'warga',
    status: 'aktif',
    no_telepon: '',
    alamat: '',
    rt: '',
    rw: '',
    dusun: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    agama: '',
    pekerjaan: '',
    pendidikan: '',
    status_perkawinan: '',
    golongan_darah: '',
    no_kk: '',
    nama_kepala_keluarga: '',
    hubungan_keluarga: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nik || !formData.nama || !formData.email || !formData.role) {
      showError('NIK, Nama, Email, dan Role wajib diisi!');
      return;
    }

    if (formData.nik.length !== 16) {
      showError('NIK harus 16 digit!');
      return;
    }

    setLoading(true);

    try {
      await api.post('/admin/users', formData);
      showToast('User berhasil ditambahkan!');
      onSuccess();
    } catch (err) {
      console.error('Error adding user:', err);
      showError(err.response?.data?.message || 'Gagal menambahkan user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-slate-700 via-slate-800 to-blue-900 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Tambah User Baru</h2>
                <p className="text-sm text-slate-200 mt-1">Login: NIK sebagai username, password default: password123</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Info Box */}
          <div className="bg-purple-50 border-l-4 border-purple-600 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">ℹ</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 mb-1">Informasi Login User</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                    <strong>Username:</strong> NIK yang didaftarkan
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                    <strong>Password Default:</strong> password123 (user dapat mengubahnya setelah login)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NIK */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4 text-purple-600" />
                NIK (Username) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                placeholder="16 digit NIK"
                maxLength={16}
                className="input w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">NIK ini akan digunakan sebagai username</p>
            </div>

            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Nama lengkap"
                className="input w-full"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-600" />
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="input w-full"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                Password (Opsional)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Kosongkan untuk password default"
                className="input w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Default: <strong>password123</strong></p>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input w-full"
                required
              >
                <option value="warga">Warga</option>
                <option value="verifikator">Verifikator RT/RW</option>
                <option value="admin">Admin Desa</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input w-full"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>

            {/* No Telepon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-600" />
                No. Telepon
              </label>
              <input
                type="tel"
                value={formData.no_telepon}
                onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="input w-full"
              />
            </div>

            {/* RT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Home className="w-4 h-4 text-purple-600" />
                RT
              </label>
              <input
                type="text"
                value={formData.rt}
                onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                placeholder="001"
                className="input w-full"
              />
            </div>

            {/* RW */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Home className="w-4 h-4 text-purple-600" />
                RW
              </label>
              <input
                type="text"
                value={formData.rw}
                onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                placeholder="001"
                className="input w-full"
              />
            </div>

            {/* Dusun */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dusun
              </label>
              <input
                type="text"
                value={formData.dusun}
                onChange={(e) => setFormData({ ...formData, dusun: e.target.value })}
                placeholder="Nama dusun"
                className="input w-full"
              />
            </div>

            {/* Tempat Lahir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                Tempat Lahir
              </label>
              <input
                type="text"
                value={formData.tempat_lahir}
                onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                placeholder="Kota kelahiran"
                className="input w-full"
              />
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={formData.tanggal_lahir}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                className="input w-full"
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Kelamin
              </label>
              <select
                value={formData.jenis_kelamin}
                onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* Agama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-purple-600" />
                Agama
              </label>
              <select
                value={formData.agama}
                onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih Agama</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>

            {/* Pendidikan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                Pendidikan
              </label>
              <select
                value={formData.pendidikan}
                onChange={(e) => setFormData({ ...formData, pendidikan: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih Pendidikan</option>
                <option value="Tidak Sekolah">Tidak Sekolah</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA/SMK">SMA/SMK</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>

            {/* Pekerjaan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-600" />
                Pekerjaan
              </label>
              <select
                value={formData.pekerjaan}
                onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih Pekerjaan</option>
                <option value="Belum/Tidak Bekerja">Belum/Tidak Bekerja</option>
                <option value="Pelajar/Mahasiswa">Pelajar/Mahasiswa</option>
                <option value="PNS">PNS</option>
                <option value="TNI/Polri">TNI/Polri</option>
                <option value="Karyawan Swasta">Karyawan Swasta</option>
                <option value="Wiraswasta">Wiraswasta</option>
                <option value="Petani">Petani</option>
                <option value="Pedagang">Pedagang</option>
                <option value="Guru">Guru</option>
                <option value="Dokter">Dokter</option>
                <option value="Perawat">Perawat</option>
                <option value="IT Consultant">IT Consultant</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Status Perkawinan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Perkawinan
              </label>
              <select
                value={formData.status_perkawinan}
                onChange={(e) => setFormData({ ...formData, status_perkawinan: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih Status</option>
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Kawin">Kawin</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Cerai Mati">Cerai Mati</option>
              </select>
            </div>

            {/* Golongan Darah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-purple-600" />
                Golongan Darah
              </label>
              <select
                value={formData.golongan_darah}
                onChange={(e) => setFormData({ ...formData, golongan_darah: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih Golongan Darah</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>

            {/* No KK */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor KK
              </label>
              <input
                type="text"
                value={formData.no_kk}
                onChange={(e) => setFormData({ ...formData, no_kk: e.target.value })}
                placeholder="16 digit nomor KK"
                maxLength={16}
                className="input w-full"
              />
            </div>

            {/* Nama Kepala Keluarga */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Kepala Keluarga
              </label>
              <input
                type="text"
                value={formData.nama_kepala_keluarga}
                onChange={(e) => setFormData({ ...formData, nama_kepala_keluarga: e.target.value })}
                placeholder="Nama kepala keluarga"
                className="input w-full"
              />
            </div>

            {/* Hubungan Keluarga */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hubungan Keluarga
              </label>
              <select
                value={formData.hubungan_keluarga}
                onChange={(e) => setFormData({ ...formData, hubungan_keluarga: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih Hubungan</option>
                <option value="Kepala Keluarga">Kepala Keluarga</option>
                <option value="Istri">Istri</option>
                <option value="Anak">Anak</option>
                <option value="Orang Tua">Orang Tua</option>
                <option value="Cucu">Cucu</option>
                <option value="Menantu">Menantu</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Alamat - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                Alamat Lengkap
              </label>
              <textarea
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                placeholder="Alamat lengkap"
                rows={3}
                className="input w-full"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Menyimpan...' : 'Tambah User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSuccess, showToast, showError }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: user.role || 'warga',
    status: user.status || 'aktif'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await api.put(`/admin/users/${user.id}`, formData);
      showToast('Role dan status user berhasil diupdate!');
      onSuccess();
    } catch (err) {
      showError(err.response?.data?.message || 'Gagal update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-blue-900 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Edit User</h2>
                <p className="text-sm text-slate-200 mt-1">Update role & status</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* User Info Card */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 mb-6 border border-slate-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">NIK:</span>
                <span className="text-sm text-slate-900">{user.nik}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">Nama:</span>
                <span className="text-sm font-semibold text-slate-900">{user.nama}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">Email:</span>
                <span className="text-sm text-slate-900">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> Untuk mengedit data lengkap warga (NIK, nama, alamat, dll), gunakan menu <strong>Data Warga</strong>.
            </p>
          </div>

          {/* Role Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition"
              disabled={user.role === 'super_admin'}
            >
              <option value="warga">Warga</option>
              <option value="verifikator">Verifikator RT/RW</option>
              <option value="admin">Admin Desa</option>
              {user.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
            </select>
            {user.role === 'super_admin' && (
              <p className="text-xs text-red-600 mt-1">Role Super Admin tidak dapat diubah</p>
            )}
          </div>

          {/* Status Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition"
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || user.role === 'super_admin'}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Menyimpan...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete User Modal Component
function DeleteUserModal({ user, onClose, onSuccess, showToast, showError }) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'HAPUS') {
      showError('Ketik "HAPUS" untuk konfirmasi!');
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/admin/users/${user.id}`);
      showToast('User berhasil dihapus!');
      onSuccess();
    } catch (err) {
      showError(err.response?.data?.message || 'Gagal menghapus user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Hapus User</h2>
              <p className="text-sm text-red-100 mt-1">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-red-800 font-medium mb-2">
              ⚠️ Anda akan menghapus user:
            </p>
            <div className="bg-white rounded-lg p-3 mt-2">
              <p className="font-bold text-gray-900">{user.nama}</p>
              <p className="text-sm text-gray-600">NIK: {user.nik}</p>
              <p className="text-sm text-gray-600">Email: {user.email}</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ketik <span className="font-bold text-red-600">HAPUS</span> untuk konfirmasi
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Ketik HAPUS"
              className="input w-full"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || confirmText !== 'HAPUS'}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Menghapus...' : 'Hapus User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Detail User Modal Component
function DetailUserModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-slate-700 via-slate-800 to-blue-900 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Detail User</h2>
                <p className="text-sm text-slate-200 mt-1">Informasi lengkap user</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">NIK</label>
              <p className="text-gray-900 font-medium mt-1">{user.nik || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Nama Lengkap</label>
              <p className="text-gray-900 font-medium mt-1">{user.nama || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
              <p className="text-gray-900 font-medium mt-1">{user.email || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">No. Telepon</label>
              <p className="text-gray-900 font-medium mt-1">{user.no_telepon || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Role</label>
              <p className="text-gray-900 font-medium mt-1 capitalize">{user.role?.replace('_', ' ') || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
              <p className="text-gray-900 font-medium mt-1 capitalize">{user.status || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">RT/RW</label>
              <p className="text-gray-900 font-medium mt-1">{user.rt && user.rw ? `${user.rt}/${user.rw}` : '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Tempat Lahir</label>
              <p className="text-gray-900 font-medium mt-1">{user.tempat_lahir || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Tanggal Lahir</label>
              <p className="text-gray-900 font-medium mt-1">{user.tanggal_lahir || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Jenis Kelamin</label>
              <p className="text-gray-900 font-medium mt-1">{user.jenis_kelamin || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Agama</label>
              <p className="text-gray-900 font-medium mt-1">{user.agama || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Pekerjaan</label>
              <p className="text-gray-900 font-medium mt-1">{user.pekerjaan || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Pendidikan</label>
              <p className="text-gray-900 font-medium mt-1">{user.pendidikan || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Status Perkawinan</label>
              <p className="text-gray-900 font-medium mt-1">{user.status_perkawinan || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Golongan Darah</label>
              <p className="text-gray-900 font-medium mt-1">{user.golongan_darah || '-'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Alamat</label>
              <p className="text-gray-900 font-medium mt-1">{user.alamat || '-'}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-medium hover:shadow-lg transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reset Password Modal Component
function ResetPasswordModal({ user, onClose, onSuccess, showToast, showError }) {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!newPassword || newPassword.length < 6) {
      showError('Password minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Password dan konfirmasi password tidak sama');
      return;
    }

    try {
      setLoading(true);
      await api.put(`/admin/users/${user.id}/reset-password`, {
        newPassword: newPassword
      });
      
      showToast(`Password untuk ${user.nama} berhasil direset!`);
      onSuccess();
    } catch (err) {
      console.error('Error resetting password:', err);
      showError(err.response?.data?.message || 'Gagal reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-blue-900 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Reset Password</h2>
                <p className="text-sm text-slate-200 mt-1">Reset password untuk {user.nama}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleResetPassword} className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-blue-900 rounded-full flex items-center justify-center text-white font-bold">
                {user.nama?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{user.nama}</p>
                <p className="text-sm text-gray-600">{user.nik}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Password Baru <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-slate-700 focus:ring focus:ring-slate-200 focus:ring-opacity-50 transition-all"
                placeholder="Masukkan password baru"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Konfirmasi Password <span className="text-red-500">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-slate-700 focus:ring focus:ring-slate-200 focus:ring-opacity-50 transition-all"
              placeholder="Konfirmasi password baru"
              required
              minLength={6}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Password tidak sama</p>
            )}
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-800">Perhatian!</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Setelah password direset, user harus login menggunakan password baru ini. 
                  Pastikan untuk memberitahu password baru kepada user yang bersangkutan.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Mereset...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Users;
