import { useEffect, useState } from "react";
import styles from "./sortModal.module.css";

const SortModal = ({
  columns,
  table,
  setIsSortModal,
  setSortOrder,
  setOrderBy
}: {
  columns: string[];
  table: string;
  setIsSortModal: (isFilterModal: boolean) => void;
  setOrderBy: (orderBy: string ) => void;
  setSortOrder: (sortOrder: string) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedColumnValue, setSelectedColumnValue] = useState("");
  const [columnValues, setColumnValues] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8080/api/columns`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({table_name: table}),
          });
        const data = await response.json();
        console.log(data);
        setColumnValues(data);
        setLoading(false);
      } catch (error) {
        console.error("Ошибка при получении данных:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [table]);

  const handleChangeSortOrder = (e: string) => {
    setSortOrder(e);
  }

  const handleChangeOrderBy = (e: string) => {
    setOrderBy(e);
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Сортировка</h2>
        <select onChange={(e) => handleChangeOrderBy(e.target.value)}>
          <option value="">Все</option>
          {columns.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select onChange={(e) => handleChangeSortOrder(e.target.value)}>
          <option value="desc">По убыванию</option>
          <option value="asc">По возрастанию</option>
        </select>
        <button
          onClick={() => {
            setIsSortModal(false);
          }}
        >
          Закрыть
        </button>
        {/* <button onClick={resetFilters}>Сбросить фильтр</button> */}
      </div>
    </div>

  //   <div className={styles.modalOverlay}>
  //     <div className={styles.modal}>
  //       <h2>Сортировка</h2>
  //       <div>
  //         {columns.map((column) => (
  //           <div key={column}>
  //             <span>{column}</span>
  //             <select
  //               onChange={(e) => handleSortChange(e, column.toLowerCase())}
  //               value={sortConfig.key === column.toLowerCase() ? sortConfig.direction : ''}
  //             >
  //               <option value="">Выберите сортировку</option>
  //               <option value="ascending">По возрастанию</option>
  //               <option value="descending">По убыванию</option>
  //             </select>
  //           </div>
  //         ))}
  //       </div>
  //       <button onClick={resetSorting}>Сбросить сортировку</button>
  //       <button onClick={closeSortModal}>Закрыть</button>
  //     </div>
  //   </div>
  );
};

export default SortModal;