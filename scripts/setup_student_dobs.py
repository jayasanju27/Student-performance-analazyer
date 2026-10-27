import sqlite3
import datetime
import re
from pathlib import Path
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

# Base deterministic DOB generator for 58 students:
# Spread between 2005-01-01 and 2005-12-31 to give each student a realistic, unique DOB.
BASE_DATES = [
    "15/05/2005", "22/08/2005", "10/11/2005", "03/02/2006", "18/07/2005",
    "14/09/2005", "29/01/2006", "05/06/2005", "12/12/2005", "25/03/2006",
    "08/10/2005", "19/04/2005", "27/05/2005", "02/11/2005", "16/01/2006",
    "20/09/2005", "30/08/2005", "11/04/2006", "07/07/2005", "23/10/2005",
    "17/03/2006", "09/06/2005", "26/12/2005", "04/01/2006", "21/05/2005",
    "13/08/2005", "31/10/2005", "06/02/2006", "15/09/2005", "28/11/2005",
    "01/04/2006", "12/07/2005", "24/06/2005", "09/10/2005", "18/03/2006",
    "05/01/2006", "22/05/2005", "14/08/2005", "03/11/2005", "27/02/2006",
    "16/07/2005", "10/12/2005", "25/04/2006", "08/09/2005", "19/06/2005",
    "02/10/2005", "21/01/2006", "11/05/2005", "29/08/2005", "07/12/2005",
    "17/04/2006", "26/09/2005", "04/07/2005", "13/11/2005", "20/02/2006",
    "15/06/2005", "28/10/2005", "09/03/2006"
]

def update_db(db_path: Path):
    if not db_path.exists():
        print(f"Skipping {db_path} (does not exist)")
        return {}

    print(f"\nProcessing database: {db_path}")
    con = sqlite3.connect(db_path)
    cur = con.cursor()

    # Check if date_of_birth column exists in students
    columns = [col[1] for col in cur.execute("PRAGMA table_info(students)").fetchall()]
    if "date_of_birth" not in columns:
        print("Adding column date_of_birth to students table...")
        cur.execute("ALTER TABLE students ADD COLUMN date_of_birth VARCHAR(20)")
        con.commit()

    students = cur.execute("SELECT id, user_id, register_number, full_name FROM students ORDER BY register_number").fetchall()
    print(f"Found {len(students)} students.")

    mapping = {}
    for idx, (s_id, u_id, reg_no, name) in enumerate(students):
        dob = BASE_DATES[idx % len(BASE_DATES)]
        mapping[reg_no] = {
            "name": name,
            "dob": dob,
        }
        # Update student date_of_birth
        cur.execute("UPDATE students SET date_of_birth = ? WHERE id = ?", (dob, s_id))

        # Convert DD/MM/YYYY to ISO YYYY-MM-DD
        d, m, y = dob.split('/')
        iso_dob = f"{y}-{m}-{d}"
        dob_hash = pwd_context.hash(dob)

        # Update user password_hash to DOB hash so both bcrypt and raw DOB match
        cur.execute("UPDATE users SET password_hash = ? WHERE id = ?", (dob_hash, u_id))

    con.commit()
    con.close()
    print(f"Updated {len(students)} students in {db_path}")
    return mapping

def main():
    base_dir = Path(__file__).resolve().parent.parent
    db_backend = base_dir / "backend" / "academic_analyzer.db"
    db_root = base_dir / "academic_analyzer.db"

    mapping = update_db(db_backend)
    update_db(db_root)

    print("\nSample Student DOB mapping:")
    for reg, data in list(mapping.items())[:15]:
        print(f"  {reg} ({data['name']}) -> DOB: {data['dob']}")

if __name__ == '__main__':
    main()
