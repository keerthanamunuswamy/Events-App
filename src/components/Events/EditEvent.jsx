import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Modal from "../UI/Modal.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import EventForm from "./EventForm.jsx";
import { updateEvent, fetchEvent } from "../../util/http.js";
import { useMutation } from "@tanstack/react-query";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { queryClient } from "../../util/http.js";
export default function EditEvent() {
  const params = useParams();
  const navigate = useNavigate();
  const submit = useSubmit();
  const navigation = useNavigation();
  const { data, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    staleTime: 10000,
  });

  //   const { mutate } = useMutation({
  //     mutationFn: updateEvent,

  //     //optimistic updating...

  //     onMutate: async (data) => {
  //       const newEvent = data.event;

  //       await queryClient.cancelQueries({ queryKey: ["events", params.id] });
  //       const previousEvent = queryClient.getQueryData(["events", params.id]);

  //       queryClient.setQueryData(["events", params.id], newEvent);

  //       return { previousEvent };
  //     },
  //     onError: (error, data, context) => {
  //       queryClient.setQueryData(["events", params.id], context.previousEvent);
  //     },
  //     onSettled: () => {
  //       queryClient.invalidateQueries(["events", params.id]);
  //     },
  //   });

  function handleSubmit(formData) {
    submit(formData, { method: "PUT" });
    // mutate({ id: params.id, event: formData });
    // navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  //   if (isPending) {
  //     content = <LoadingIndicator />;
  //   }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to fetch detail"
          message={
            error.info?.message ||
            "Failed to load event detail. Try again later..."
          }
        />
        <div className="form-actions">
          <Link to="../">Okay</Link>
        </div>
      </>
    );
  }
  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }
  return (
    <Modal onClose={handleClose}>
      {content}
      {/* {hasEditError && (
        <ErrorBlock
          title="Failed to update event"
          message={
            editError.info?.message ||
            "Failed to update event detail. Try again later..."
          }
        />
      )} */}
    </Modal>
  );
}

export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const requestData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: requestData });
  await queryClient.invalidateQueries(["events"]);
  return redirect("../");
}
