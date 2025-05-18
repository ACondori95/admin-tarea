import React from "react";

const UserCard = ({userInfo}) => {
  return (
    <div className='user-card p-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <img
            src={userInfo?.profileImageUrl}
            alt={`Avatar`}
            className='w-12 h-12 rounded-full border-2 border-white'
          />

          <div>
            <p className='text-sm font-medium'>{userInfo?.name}</p>
            <p className='text-xs text-gray-500'>{userInfo?.email}</p>
          </div>
        </div>
      </div>

      <div className='flex items-end gap-3 mt-5'>
        <StatCard
          label='Pendiente'
          count={userInfo?.pendingTasks || 0}
          status='Pendiente'
        />
        <StatCard
          label='En Progreso'
          count={userInfo?.inProgressTasks || 0}
          status='En Progreso'
        />
        <StatCard
          label='Completada'
          count={userInfo?.completedTasks || 0}
          status='Completada'
        />
      </div>
    </div>
  );
};

export default UserCard;

const StatCard = ({label, count, status}) => {
  const getStatusTagColor = () => {
    switch (status) {
      case "En Progreso":
        return "text-cyan-500 bg-gray-50";
      case "Completada":
        return "text-indigo-500 bg-indigo-50";
      default:
        return "text-violet-500 bg-violet-50";
    }
  };

  return (
    <div
      className={`flex-1 text-[10px] font-medium ${getStatusTagColor()} px-4 py-0.5 rounded`}>
      <span className='text-[12px] font-semibold'>{count}</span> <br /> {label}
    </div>
  );
};
