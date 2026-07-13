import os
import re

src_dir = "c:\\Users\\montader\\my progicts\\Gym-System\\src"

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(".ts") or file.endswith(".tsx"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()

            new_content = content
            
            # Replace prisma.settings with prisma.coachProfile
            new_content = re.sub(r"prisma\.settings\.", "prisma.coachProfile.", new_content)
            
            # For data: { ... } in create/update where coachId is missing, 
            # this is too complex for simple regex. We'll just patch the specific lines we know.
            
            if new_content != content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)

print("Settings patched. Now we must fix coachId in creates.")
