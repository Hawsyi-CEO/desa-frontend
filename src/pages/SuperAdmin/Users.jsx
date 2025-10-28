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
  const [currentLimit, setCurrentLimit] = useState(10);
  const [viewAll, setViewAll] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
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
      case 'super_admin': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'admin': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'verifikator': return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'warga': return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
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
      case 'admin': return 'Admin RT/RW';
      case 'verifikator': return 'Admin RT/RW';
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
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              Manajemen User
            </h1>
            <p className="text-gray-600 mt-2 ml-13">Kelola semua pengguna sistem</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <UserPlus className="w-5 h-5" />
            <span>Tambah User</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <UsersIcon className="w-5 h-5" />
              <p className="text-sm font-medium opacity-90">Total User</p>
            </div>
            <p className="text-3xl font-bold">{stats.total.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5" />
              <p className="text-sm font-medium opacity-90">Super Admin</p>
            </div>
            <p className="text-3xl font-bold">{stats.super_admin}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <UserCog className="w-5 h-5" />
              <p className="text-sm font-medium opacity-90">Admin RT/RW</p>
            </div>
            <p className="text-3xl font-bold">{stats.admin}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-5 h-5" />
              <p className="text-sm font-medium opacity-90">Admin RT/RW</p>
            </div>
            <p className="text-3xl font-bold">{stats.verifikator}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5" />
              <p className="text-sm font-medium opacity-90">Warga</p>
            </div>
            <p className="text-3xl font-bold">{stats.warga.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-5 h-5" />
              <p className="text-sm font-medium opacity-90">Aktif</p>
            </div>
            <p className="text-3xl font-bold">{stats.aktif.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
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
                className="w-full h-12 pl-12 pr-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-6 h-12 rounded-xl font-medium transition-all ${
                showFilters 
                  ? 'bg-purple-600 text-white shadow-lg' 
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
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Semua Role</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin RT/RW</option>
                  <option value="verifikator">Admin RT/RW (Legacy)</option>
                  <option value="warga">Warga</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-300"
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
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300"
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
                                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-110 ring-2 ring-purple-300'
                                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:scale-105'
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
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Tambah User Baru</h2>
                <p className="text-sm text-purple-100 mt-1">Login: NIK sebagai username, password default: password123</p>
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
                <option value="verifikator">Admin RT/RW</option>
                <option value="admin">Admin RT/RW</option>
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Menyimpan...' : 'Tambah User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Users;
