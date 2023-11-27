import { timeParse, bisector } from "d3";
import { enqueueSnackbar } from 'notistack';

export const parseDate = timeParse("%d-%m-%Y");

export const showToast = (message, variant) => {
  enqueueSnackbar(message, { variant });
};

export const getColor = (data) => {
  if (data.length > 0) {
    if (data[0].nav < data[data.length - 1].nav) {
      return "#0fd183";
    } else {
      return "#f55361";
    }
  } else {
    return "blue";
  }
};

export const formatDate = (date) => {
  const d = date instanceof Date ? date : typeof date === "number" ? new Date(date) : parseDate(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

export const bisectDate = (data, x0) => {
  const dateBisector = bisector((d) => d.date).left;
  const index = dateBisector(data, x0, 1);
  const d0 = data[index - 1];
  const d1 = data[index];
  return d1 && (x0 - d0.date > d1.date - x0) ? d1 : d0;
};