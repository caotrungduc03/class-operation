import CustomDropdown from "../common/CustomDropdown";

interface TableActionProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

const TableAction = ({ onEdit, onDelete }: TableActionProps) => {
  return (
    <CustomDropdown>
      {onEdit && <button onClick={onEdit}>Edit</button>}
      {onDelete && <button onClick={onDelete}>Delete</button>}
    </CustomDropdown>
  );
};

export default TableAction;
