import { useEffect, useState } from 'react';
import styles from './index.module.css';
import { ReactComponent as RemoveIcon } from './svg/icons8-remove.svg';

export default function App() {
  // declare state
  const [guestList, setGuestList] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(true);

  // functions

  // fetch all guests on first render
  const baseUrl = 'http://localhost:4000';

  useEffect(() => {
    async function fetchGuests() {
      const response = await fetch(`${baseUrl}/guests`);
      console.log(response);

      const allGuests = await response.json();
      setGuestList([...allGuests]);
      setLoading(false);
    }

    fetchGuests().catch((error) => console.log(error));
  }, []);

  async function handleSubmit(event) {
    if (event.key === 'Enter') {
      const response = await fetch(`${baseUrl}/guests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          attending: false,
        }),
      });
      const createdGuest = await response.json();

      setGuestList([...guestList, createdGuest]);

      setFirstName('');
      setLastName('');
    }
  }

  // async function handleCheckboxInput(event) {
  //   event.target.value;
  // }

  // JSX
  return (
    <main className={styles.main}>
      <hgroup>
        <h1>The Guest List ✍🏻</h1>
        <p>Easily track who's coming to your event</p>
      </hgroup>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label>
          First name
          <input
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            name="firstname"
            disabled={loading}
          />
        </label>
        <label>
          Last name
          <input
            value={lastName}
            name="firstname"
            onKeyDown={handleSubmit}
            onChange={(event) => setLastName(event.target.value)}
            disabled={loading}
          />
        </label>
      </form>

      <ul className={styles['guest-list']}>
        <li className={styles['list-header']}>
          <span>First Name</span>
          <span>Last Name</span>
          <span>Attending</span>
        </li>
        {loading ? (
          <p>Loading...</p>
        ) : (
          guestList.map((guest) => {
            return (
              <li key={`guest-${guest.id}`}>
                <div data-test-id="guest" className={styles['guest-record']}>
                  <span>{guest.firstName}</span>
                  <span>{guest.lastName}</span>
                  <input
                    type="checkbox"
                    checked={guest.attending}
                    aria-label="attending"
                    value={guest.attending}
                    onChange={(event) => {
                      async function updateGuest() {
                        const checkedStatus = event.target.checked;
                        const response = await fetch(
                          `${baseUrl}/guests/${guest.id}`,
                          {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ attending: checkedStatus }),
                          },
                        );
                        const updatedGuest = await response.json();

                        const originalGuestRecord = guestList.find(
                          (element) => element.id === updatedGuest.id,
                        );
                        const originalGuestRecordIndex =
                          guestList.indexOf(originalGuestRecord);
                        console.log(
                          guestList.splice(
                            originalGuestRecordIndex,
                            1,
                            updatedGuest,
                          ),
                        );

                        setGuestList([...guestList]);
                      }

                      updateGuest().catch((error) => console.log(error));
                    }}
                  />
                  <button
                    className={styles['button-remove']}
                    onClick={() => {
                      async function removeGuest() {
                        const response = await fetch(
                          `${baseUrl}/guests/${guest.id}`,
                          { method: 'DELETE' },
                        );

                        const deletedGuest = await response.json();
                        console.log(deletedGuest);
                      }

                      removeGuest().catch((error) => console.log(error));
                      const updatedGuestList = guestList.filter(
                        (originalGuest) => originalGuest.id !== guest.id,
                      );
                      setGuestList(updatedGuestList);
                    }}
                  >
                    <RemoveIcon />
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </main>
  );
}
