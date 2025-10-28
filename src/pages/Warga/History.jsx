import Layout from '../../components/Layout';

const WargaHistory = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">History Pengajuan Surat</h1>
          <div className="card">
            <p className="text-gray-600">
              Lihat semua surat yang pernah Anda ajukan beserta statusnya.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Coming soon - List history dengan detail dan tracking status.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WargaHistory;
