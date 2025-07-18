
// Componente Select
export const Select = ({ label, error, icon: Icon, children, ...props }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
        )}
        <select
          className={`w-full rounded-xl border py-4 pr-4 transition-all duration-200 focus:ring-2 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none ${
            Icon ? "pl-10" : "px-4"
          } ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          }`}
          {...props}
        >
          {children}
        </select>
      </div>
      {error && (
        <p className="mt-2 flex items-center text-sm text-red-500">
          <span className="mr-2 h-2 w-2 rounded-full bg-red-500"></span>
          {error}
        </p>
      )}
    </div>
  );
};

// Componente Page
export const Page = ({  children }) => {
  return (//bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800
    <div className="min-h-screen transition-all duration-300">
      <div className="mx-auto max-w-6xl p-6">
        {children}
      </div>
    </div>
  );
};

// Componente Textarea
export const Textarea = ({ label, error, ...props }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
        {label}
      </label>
      <textarea
        className={`w-full resize-none rounded-xl border px-4 py-4 transition-all duration-200 focus:ring-2 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
        }`}
        {...props}
      />
      {error && (
        <p className="mt-2 flex items-center text-sm text-red-500">
          <span className="mr-2 h-2 w-2 rounded-full bg-red-500"></span>
          {error}
        </p>
      )}
    </div>
  );
};

// Componente Input
export const Input = ({ label, error, icon: Icon, ...props }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
        )}
        <input
          className={`w-full rounded-xl border py-4 pr-4 transition-all duration-200 focus:ring-2 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
            Icon ? "pl-10" : "px-4"
          } ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          }`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 flex items-center text-sm text-red-500">
          <span className="mr-2 h-2 w-2 rounded-full bg-red-500"></span>
          {error}
        </p>
      )}
    </div>
  );
};

// Componente Button
export const Button = ({ children, onClick, disabled, variant = "primary", className = "", ...props }) => {
  const baseClasses = "w-full transform rounded-xl px-6 py-4 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: disabled
      ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
      : "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:scale-105 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl focus:ring-green-500",
    danger: disabled
      ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
      : "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:scale-105 hover:from-red-600 hover:to-pink-700 hover:shadow-xl focus:ring-red-500",
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Componente card
export const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg ${className}`}>
      {children}
    </div>
  );
};
