import classNames from "classnames";

interface InputGroupProps {
  className?: string;
  type: string;
  placeholder: string;
  value: string;
  error: string;
  setValue: (str: string) => void;
}

const InputGroup: React.FC<InputGroupProps> = ({
  className,
  type,
  placeholder,
  value,
  error,
  setValue,
}) => {
  return (
    <div className={className}>
      <input
        type={type}
        className={classNames(
          "w-full rounded transition duration-200 bg-gray-50 outline-none border border-gray-200 p-3 focus:bg-white hover:bg-white",
          { "border-red-500": error }
        )}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p className="text-red-600 text-sm">{error}</p>
    </div>
  );
};

export default InputGroup;
