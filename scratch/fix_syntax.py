import re

with open('public/command.html', 'r', encoding='utf-8') as f:
    html = f.read()

# The bad block starts at "      if (document.getElementById('orderScan').checked) ordersToPost.push"
# and ends right after the next "    }"
# Let's find it.
start_str = "      if (document.getElementById('orderScan').checked) ordersToPost.push({ type: \"Radiology\", item: \"Routine Scan\", priority: \"Routine\" });"

idx1 = html.find(start_str)
if idx1 != -1:
    # Find the next function declaration which would be after this block
    # or just find the "fetchLivePharma" line which was the end of the regex earlier
    idx2 = html.find("fetchLivePharma", idx1)
    if idx2 != -1:
        # find the end of that block
        idx3 = html.find("}", idx2)
        if idx3 != -1:
            # We want to remove from idx1 up to idx3 + 1
            # But wait, looking at the code I dumped earlier:
            # fetchLiveWards();
            #    });
            #      if (document.getElementById('orderScan').checked)...
            # We want to remove from the start_str to idx3+1
            
            new_html = html[:idx1] + html[idx3+1:]
            
            with open('public/command.html', 'w', encoding='utf-8') as f2:
                f2.write(new_html)
            print(f"Removed bad block from {idx1} to {idx3+1}")
        else:
            print("Could not find } after fetchLivePharma")
    else:
        # Maybe it was just "fetchLivePharmacyOrders"
        idx2 = html.find("fetchLivePharmacyOrders", idx1)
        if idx2 != -1:
            idx3 = html.find("}", idx2)
            if idx3 != -1:
                new_html = html[:idx1] + html[idx3+1:]
                with open('public/command.html', 'w', encoding='utf-8') as f2:
                    f2.write(new_html)
                print(f"Removed bad block from {idx1} to {idx3+1} via fetchLivePharmacyOrders")
        else:
            print("Could not find fetchLivePharma or fetchLivePharmacyOrders")
else:
    print("Could not find start_str")

