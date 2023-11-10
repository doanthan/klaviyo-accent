import moment from "moment";

export const CustomInput = forwardRef(({ value, onClick }, ref) => {

    let rangeArray = value.split(" - ");
    let displayValue;
    if (rangeArray[1]) {
        let displayStart = new Date(rangeArray[0]);
        let displayEnd = new Date(rangeArray[1]);

        if (rangeArray[0] === rangeArray[1]) {
            displayValue = moment(displayStart).format("DD-MMM-YYYY");
        } else {
            if (moment(displayStart).isAfter(displayEnd)) {
                displayValue =
                    moment(displayStart).format("MMM D YYYY") +
                    " - " +
                    moment(displayEnd).format("MMM D YYYY")

            } else {
                displayValue =
                    moment(displayStart).format("MMM D YYYY") +
                    " - " +
                    moment(displayEnd).format("MMM D YYYY");
            }
        }
    } else {
        let displayDate = new Date(rangeArray[0]);
        displayValue = moment(displayDate).format("MMMM Do YYYY");
    }
    return (
        <Input
            id="pickInput"
            onClick={onClick}
            ref={ref}
            value={displayValue}
            onKeyDown={(e) => {
                if (e.keyCode === 40) {
                    document.getElementById("pickInput").click();
                }
            }}
            readOnly
        />
    );
});
