import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './Pagination.css';

/**
 * Pagination Component
 * @param {number} currentPage - Trang hiện tại (1-indexed)
 * @param {number} totalPages - Tổng số trang
 * @param {function} onPageChange - Callback khi đổi trang
 * @param {number} itemsPerPage - Số item mỗi trang
 * @param {number} totalItems - Tổng số items
 */
const Pagination = ({
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    itemsPerPage = 10,
    totalItems = 0,
    showInfo = true
}) => {
    // Always show pagination, even for 1 page

    const handlePrev = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    const handleFirst = () => onPageChange(1);
    const handleLast = () => onPageChange(totalPages);

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const showPages = 5; // Số trang hiển thị
        let start = Math.max(1, currentPage - Math.floor(showPages / 2));
        let end = Math.min(totalPages, start + showPages - 1);

        // Adjust start if end is maxed out
        if (end === totalPages) {
            start = Math.max(1, end - showPages + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="pagination-container">
            {showInfo && totalItems > 0 && (
                <div className="pagination-info">
                    Hiển thị {startItem}-{endItem} / {totalItems}
                </div>
            )}

            <div className="pagination">
                <button
                    className="page-btn"
                    onClick={handleFirst}
                    disabled={currentPage === 1}
                    title="Trang đầu"
                >
                    <ChevronsLeft size={16} />
                </button>

                <button
                    className="page-btn"
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    title="Trang trước"
                >
                    <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map(page => (
                    <button
                        key={page}
                        className={`page-btn number ${currentPage === page ? 'active' : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}

                <button
                    className="page-btn"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    title="Trang sau"
                >
                    <ChevronRight size={16} />
                </button>

                <button
                    className="page-btn"
                    onClick={handleLast}
                    disabled={currentPage === totalPages}
                    title="Trang cuối"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
