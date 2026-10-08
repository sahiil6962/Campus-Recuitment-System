function main() {
    renderNavBar();
    checkAuthentication();
}

// Function to render the navigation bar
function renderNavBar() {
    if (document.querySelector('.navbar')) {
        document.querySelector('.navbar').remove();
    }

    const nav = document.createElement('nav');
    nav.className = 'navbar';

    const logo = document.createElement('div');
    logo.className = 'logo';
    logo.innerText = 'CampusRecruitment';

    const navLinks = document.createElement('ul');
    navLinks.className = 'nav-links';

    const homeLink = createNavLink('Home', () => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (token && role === 'recruiter') {
            renderRecruiterDashboard();
        } else if (token && role === 'student') {
            renderStudentDashboard();
        } else {
            renderSignupPage();
        }
    });

    const aboutLink = createNavLink('About', () => infoToastNotification('This is a simple campus recruitment system.'));
    const signinLink = createNavLink('Sign In', renderSigninPage);
    const signupLink = createNavLink('Sign Up', renderSignupPage);
    const logoutLink = createNavLink('Logout', logout);

    navLinks.appendChild(homeLink);
    navLinks.appendChild(aboutLink);

    // Check the role and add respective navigation links
    const role = localStorage.getItem('role');
    if (role === 'student') {
        const jobsLink = createNavLink('Jobs', renderJobsPage);
        const appliedJobsLink = createNavLink('Applied Jobs', renderAppliedJobsPage);
        navLinks.appendChild(jobsLink);
        navLinks.appendChild(appliedJobsLink);
    } else if (role === 'recruiter') {
        const postJobLink = createNavLink('Post Job', renderPostJobPage);
        const manageJobsLink = createNavLink('Manage Jobs', renderManageJobsPage);
        const applicationManagementLink = createNavLink('Application Management', renderApplicationsPage);
        navLinks.appendChild(postJobLink);
        navLinks.appendChild(manageJobsLink);
        navLinks.appendChild(applicationManagementLink);
    }

    navLinks.appendChild(signinLink);
    navLinks.appendChild(signupLink);
    navLinks.appendChild(logoutLink);

    nav.appendChild(logo);
    nav.appendChild(navLinks);

    document.body.prepend(nav);

    // Show/hide sign-in and sign-up links based on authentication status
    if (localStorage.getItem('token')) {
        signinLink.style.display = 'none';
        signupLink.style.display = 'none';
        logoutLink.style.display = 'block';
    } else {
        logoutLink.style.display = 'none';
    }
}

// Function to render the Manage Jobs page
// Function to render the Manage Jobs screen with styled job cards
function renderManageJobsPage() {
    const container = document.getElementById('content');
    container.innerHTML = `
        <div class="dashboard">
            <h1>Manage Your Jobs</h1>
            <div id="manage-job-listings" class="jobs-container">
                <p class="loading-text">Loading your posted jobs...</p>
            </div>
        </div>
    `;

    fetchRecruiterJobs();
}

// Function to render the Application Management page



// Function to check authentication and render dashboard
function checkAuthentication() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!document.getElementById('content')) {
        const contentContainer = document.createElement('div');
        contentContainer.id = 'content';
        document.body.appendChild(contentContainer);
    }

    if (token && role === 'recruiter') {
        renderRecruiterDashboard();
    } else if (token && role === 'student') {
        renderStudentDashboard();
    } else {
        renderSigninPage();
    }
}

// Function to create navigation links
function createNavLink(text, onClickFunction) {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#';
    link.innerText = text;
    link.onclick = (e) => {
        e.preventDefault();
        onClickFunction();
    };
    listItem.appendChild(link);
    return listItem;
}

// Function to render the signup page
function renderSignupPage() {
    const container = document.getElementById('content') || document.createElement('div');
    container.id = 'content';
    container.innerHTML = '';

    const signupContainer = document.createElement('div');
    signupContainer.className = 'login-box';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'login-header';
    const header = document.createElement('header');
    header.innerText = 'Signup';
    headerDiv.appendChild(header);

    const inputBox = document.createElement('div');
    inputBox.className = 'input-box';

    const usernameInput = createInput('text', 'username', 'Enter your username');
    const emailInput = createInput('email', 'email', 'Enter your email');
    const passwordInput = createInput('password', 'password', 'Enter your password');

    const roleSelect = document.createElement('select');
    roleSelect.id = 'role';
    roleSelect.className = 'input-field';
    roleSelect.onchange = toggleRecruiterField;

    const studentOption = document.createElement('option');
    studentOption.value = 'student';
    studentOption.innerText = 'Student';

    const recruiterOption = document.createElement('option');
    recruiterOption.value = 'recruiter';
    recruiterOption.innerText = 'Recruiter';

    roleSelect.appendChild(studentOption);
    roleSelect.appendChild(recruiterOption);

    const recruiterKeyInput = createInput('text', 'recruiterKey', 'Enter recruiter key');
    recruiterKeyInput.style.display = 'none';

    const submitDiv = document.createElement('div');
    submitDiv.className = 'input-submit';
    const submitButton = document.createElement('button');
    submitButton.className = 'submit-btn';
    submitButton.innerText = 'Sign Up';
    submitButton.onclick = signup;

    inputBox.appendChild(usernameInput);
    inputBox.appendChild(emailInput);
    inputBox.appendChild(passwordInput);
    inputBox.appendChild(roleSelect);
    inputBox.appendChild(recruiterKeyInput);

    submitDiv.appendChild(submitButton);

    signupContainer.appendChild(headerDiv);
    signupContainer.appendChild(inputBox);
    signupContainer.appendChild(submitDiv);

    container.appendChild(signupContainer);
    document.body.appendChild(container);
}

// Function to render the sign-in page
function renderSigninPage() {
    const container = document.getElementById('content') || document.createElement('div');
    container.id = 'content';
    container.innerHTML = '';

    const signinContainer = document.createElement('div');
    signinContainer.className = 'login-box';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'login-header';
    const header = document.createElement('header');
    header.innerText = 'Sign In';
    headerDiv.appendChild(header);

    const inputBox = document.createElement('div');
    inputBox.className = 'input-box';

    const emailInput = createInput('email', 'signin-email', 'Enter your email');
    const passwordInput = createInput('password', 'signin-password', 'Enter your password');

    const roleSelect = document.createElement('select');
    roleSelect.id = 'signin-role';
    roleSelect.className = 'input-field';

    const studentOption = document.createElement('option');
    studentOption.value = 'student';
    studentOption.innerText = 'Student';

    const recruiterOption = document.createElement('option');
    recruiterOption.value = 'recruiter';
    recruiterOption.innerText = 'Recruiter';

    roleSelect.appendChild(studentOption);
    roleSelect.appendChild(recruiterOption);

    const submitDiv = document.createElement('div');
    submitDiv.className = 'input-submit';
    const submitButton = document.createElement('button');
    submitButton.className = 'submit-btn';
    submitButton.innerText = 'Sign In';
    submitButton.onclick = signin;

    inputBox.appendChild(emailInput);
    inputBox.appendChild(passwordInput);
    inputBox.appendChild(roleSelect);

    submitDiv.appendChild(submitButton);

    signinContainer.appendChild(headerDiv);
    signinContainer.appendChild(inputBox);
    signinContainer.appendChild(submitDiv);

    container.appendChild(signinContainer);
    document.body.appendChild(container);
}

// Function to render recruiter dashboard
function renderRecruiterDashboard() {
    const container = document.getElementById('content');
    container.innerHTML = `
        <div class="dashboard">
            <h1>Recruiter Dashboard</h1>
            <p>Welcome to your recruiter portal.</p>
        </div>
    `;
}

// Function to render student dashboard
function renderStudentDashboard() {
    const container = document.getElementById('content');
    container.innerHTML = `
        <div class="dashboard">
            <h1>Student Dashboard</h1>
            <p>Welcome to your student portal.</p>
        </div>
    `;
}

// Function to create an input field
function createInput(type, id, placeholder) {
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.className = 'input-field';
    input.placeholder = placeholder;
    return input;
}

// Function to show/hide recruiter key field
function toggleRecruiterField() {
    const role = document.getElementById('role').value;
    const recruiterKeyField = document.getElementById('recruiterKey');
    recruiterKeyField.style.display = role === 'recruiter' ? 'block' : 'none';
}

// Function to handle signup
async function signup() {
    const submitButton = document.querySelector('.submit-btn');
    if (submitButton.classList.contains('loading') || submitButton.classList.contains('success')) return;

    submitButton.innerHTML = `
        <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    submitButton.classList.add('loading');

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const recruiterKey = document.getElementById('recruiterKey').value;

    const data = { username, email, password, role };
    if (role === 'recruiter') {
        data.recruiterAllowanceKey = recruiterKey;
    }

    try {
        const response = await axios.post('https://campusrecruitementsystem.onrender.com/signup', data);

        if (response.status === 201) {
            submitButton.classList.remove('loading');
            submitButton.classList.add('success');
            submitButton.innerText = 'Success!';

            // Trigger confetti effect
            confetti({
                particleCount: 150,
                spread: 60
            });

            successToastNotification('Signup successful!');
            renderSigninPage();
        } else {
            submitButton.innerText = 'Sign Up';
            infoToastNotification(response.data.message);
        }
    } catch (error) {
        submitButton.innerText = 'Sign Up';
        errorToastNotification('Signup failed, please try again.');
    } finally {
        submitButton.classList.remove('loading');
    }
}


// Function to handle sign-in
// Function to handle sign-in with loading animation
async function signin() {
    const submitButton = document.querySelector('.submit-btn');
    if (submitButton.classList.contains('loading')) return;

    submitButton.innerHTML = `
        <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    submitButton.classList.add('loading');

    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const role = document.getElementById('signin-role').value;

    try {
        const response = await axios.post('https://campusrecruitementsystem.onrender.com/signin', { email, password, role });

        if (response.status === 200) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', role);
            renderNavBar();
            checkAuthentication();
        } else {
            infoToastNotification(response.data.message);
        }
    } catch (error) {
        errorToastNotification('Sign in failed, Please check your credentials and try again.');
    } finally {
        submitButton.innerText = 'Sign In';
        submitButton.classList.remove('loading');
    }
}
// Function to render the Jobs page
// Function to render the Jobs page with search section
function renderJobsPage() {
    const container = document.getElementById('content');
    container.innerHTML = `
        <div class="dashboard">
            <h1>Available Jobs</h1>
            <div class="search-container">
                <input type="text" id="job-search" class="input-field" placeholder="Search for jobs through title..." />
                <button class="submit-btn" id="search-btn">Search</button>
            </div>
            <div id="job-listings" class="jobs-container">
                <p>Loading jobs...</p>
            </div>
        </div>
    `;

    // Fetch and display jobs
    fetchJobs();

    // Add event listener for search button
    document.getElementById('search-btn').addEventListener('click', () => {
        const searchBtn = document.getElementById('search-btn');
        const searchQuery = document.getElementById('job-search').value;

        if (searchBtn.classList.contains('loading')) return; // Prevent multiple clicks

        // Show loading animation
        searchBtn.innerHTML = `
            <div class="loading-dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `;
        searchBtn.classList.add('loading');

        fetchJobs(searchQuery).finally(() => {
            searchBtn.innerText = 'Search';
            searchBtn.classList.remove('loading');
        });
    });

}
// Function to fetch jobs from backend
async function fetchJobs(searchQuery = '') {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://campusrecruitementsystem.onrender.com/jobs/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({ jobTitle: searchQuery })
        });

        const data = await response.json();

        if (response.ok) {
            renderJobCards(data.jobs);
        } else {
            document.getElementById('job-listings').innerHTML = '<p>No jobs available.</p>';
            errorToastNotification(data.message || 'Failed to fetch jobs');
        }
    } catch (error) {
        console.error('Error fetching jobs:', error);
        errorToastNotification('Error fetching jobs');
    }
}


// Function to render job cards dynamically
function renderJobCards(jobs) {
    const jobListings = document.getElementById('job-listings');
    jobListings.innerHTML = '';

    if (jobs.length === 0) {
        jobListings.innerHTML = '<p>No available jobs. You have applied to all jobs.</p>';
        return;
    }

    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.innerHTML = `
            <h3><strong>Job Title: </strong>${job.jobTitle}</h3>
            <p><strong>Location:</strong> ${job.jobLocation}</p>
            <p><strong>Type:</strong> ${job.jobType}</p>
            <p><strong>Salary:</strong> $${job.jobSalary}</p>
            <p><strong>Requirements:</strong> ${job.jobRequirements}</p>
            <button class="apply-btn" id="apply-${job._id}" onclick="applyForJob('${job._id}')">Apply</button>
        `;

        jobListings.appendChild(jobCard);
    });
}


async function applyForJob(jobId) {
    const applyButton = document.getElementById(`apply-${jobId}`);
    if (applyButton.classList.contains('loading')) return; // Prevent multiple clicks

    // Show loading animation
    applyButton.innerHTML = `
        <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    applyButton.classList.add('loading');

    try {
        const token = localStorage.getItem('token');

        const response = await fetch('https://campusrecruitementsystem.onrender.com/applications/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({ jobId })
        });

        const data = await response.json();

        if (response.ok) {
            successToastNotification(data.message || 'Application submitted successfully!');

            // Change button text to "Applied" and disable it
            applyButton.innerText = 'Applied';
            applyButton.disabled = true;
            applyButton.classList.remove('loading');

            // Remove applied job from the job list
            removeJobFromList(jobId);
        } else {
            applyButton.innerText = 'Apply';
            errorToastNotification(data.message || 'Failed to apply for the job');
        }
    } catch (error) {
        console.error('Error applying for job:', error);
        applyButton.innerText = 'Apply';
        errorToastNotification('Error applying for the job');
    } finally {
        applyButton.classList.remove('loading');
    }
}

// Function to remove the applied job from the frontend list
function removeJobFromList(jobId) {
    const jobCard = document.getElementById(`apply-${jobId}`).closest('.job-card');
    if (jobCard) {
        jobCard.remove();
    }

    // If no jobs left, show message
    const jobListings = document.getElementById('job-listings');
    if (!jobListings.hasChildNodes()) {
        jobListings.innerHTML = '<p>No available jobs. You have applied to all jobs.</p>';
    }
}


// Function to render the Applied Jobs page
function renderAppliedJobsPage() {
    const container = document.getElementById('content');
    container.innerHTML = `
        <div class="applied-jobs-container">
            <h1>Below are the Applications applied by you.</h1>
            <div id="applied-job-listings" class="applied-job-listings">
                <p>Loading applied jobs...</p>
            </div>
        </div>
    `;

    // Fetch and display applied jobs
    fetchAppliedJobs();
}

// Function to fetch applied jobs from backend
async function fetchAppliedJobs() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://campusrecruitementsystem.onrender.com/applications', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            }
        });

        const data = await response.json();

        if (response.ok) {
            renderAppliedJobCards(data.applications);
        } else {
            document.getElementById('applied-job-listings').innerHTML = '<p>No applied jobs found.</p>';
            errorToastNotification(data.message || 'Failed to fetch applied jobs');
        }
    } catch (error) {
        console.error('Error fetching applied jobs:', error);
        errorToastNotification('Error fetching applied jobs');
    }
}

// Function to render applied job cards dynamically
// Function to render applied job cards dynamically
function renderAppliedJobCards(appliedJobs) {
    const jobListings = document.getElementById('applied-job-listings');
    jobListings.innerHTML = '';

    if (appliedJobs.length === 0) {
        jobListings.innerHTML = '<p>No applied jobs found.</p>';
        return;
    }

    appliedJobs.forEach(application => {
        const job = application.jobID;
        const jobCard = document.createElement('div');
        jobCard.className = 'applied-job-card';

        let withdrawButtonHTML = '';
        if (application.status !== 'Accepted' && application.status !== 'Rejected') {
            withdrawButtonHTML = `
                <button class="withdraw-btn" id="withdraw-${application._id}" onclick="withdrawApplication('${application._id}')">
                    Withdraw Application
                </button>
            `;
        }

        jobCard.innerHTML = `
            <h3><strong>Job Title: </strong>${job.jobTitle}</h3>
            <p><strong>Location:</strong> ${job.jobLocation}</p>
            <p><strong>Type:</strong> ${job.jobType}</p>
            <p><strong>Salary:</strong> $${job.jobSalary}</p>
            <p><strong>Status:</strong> ${application.status}</p>
            ${withdrawButtonHTML}
        `;

        jobListings.appendChild(jobCard);
    });
}


// Function to withdraw an application
async function withdrawApplication(applicationId) {
    const withdrawButton = document.getElementById(`withdraw-${applicationId}`);
    if (withdrawButton.classList.contains('loading')) return;

    // Show loading animation
    withdrawButton.innerHTML = `
        <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    withdrawButton.classList.add('loading');

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://campusrecruitementsystem.onrender.com/applications/withdraw', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({ applicationId })
        });

        const data = await response.json();

        if (response.ok) {
            successToastNotification(data.message || 'Application withdrawn successfully!');
            removeAppliedJobFromList(applicationId);
        } else {
            withdrawButton.innerText = 'Withdraw Application';
            errorToastNotification(data.message || 'Failed to withdraw application');
        }
    } catch (error) {
        console.error('Error withdrawing application:', error);
        withdrawButton.innerText = 'Withdraw Application';
        errorToastNotification('Error withdrawing application');
    } finally {
        withdrawButton.classList.remove('loading');
    }
}

// Function to remove the withdrawn job from the applied jobs list
function removeAppliedJobFromList(applicationId) {
    const jobCard = document.getElementById(`withdraw-${applicationId}`).closest('.applied-job-card');
    if (jobCard) {
        jobCard.remove();
    }

    // If no applied jobs left, show message
    const jobListings = document.getElementById('applied-job-listings');
    if (!jobListings.hasChildNodes()) {
        jobListings.innerHTML = '<p>No applied jobs found.</p>';
    }
}
// Function to render the Post Job screen
// Function to render the Post Job screen with field labels
function renderPostJobPage() {
    const container = document.getElementById('content');
    container.innerHTML = `
        <div class="dashboard">
            <h1>Post a New Job</h1>
            <form id="post-job-form" class="job-form">
                <div class="form-group">
                    <label for="jobTitle">Job Title:</label>
                    <input type="text" id="jobTitle" class="input-field" placeholder="Enter job title" required />
                </div>

                <div class="form-group">
                    <label for="jobDescription">Job Description:</label>
                    <textarea id="jobDescription" class="input-field" placeholder="Enter job description" required></textarea>
                </div>

                <div class="form-group">
                    <label for="jobRequirements">Job Requirements:</label>
                    <input type="text" id="jobRequirements" class="input-field" placeholder="Enter job requirements" required />
                </div>

                <div class="form-group">
                    <label for="jobLocation">Job Location:</label>
                    <input type="text" id="jobLocation" class="input-field" placeholder="Enter job location" required />
                </div>

                <div class="form-group">
                    <label for="jobType">Job Type:</label>
                    <select id="jobType" class="input-field">
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Internship">Internship</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="jobSalary">Salary:</label>
                    <input type="number" id="jobSalary" class="input-field" placeholder="Enter salary" required />
                </div>

                <div class="input-submit">
                    <button type="submit" class="submit-btn">Post Job</button>
                </div>
            </form>
        </div>
    `;

    // Add event listener for form submission
    document.getElementById('post-job-form').addEventListener('submit', postJob);
}



// Function to handle job posting
async function postJob(event) {
    event.preventDefault();

    const submitButton = document.querySelector('.submit-btn');
    if (submitButton.classList.contains('loading')) return; // Prevent multiple submissions

    // Show loading animation
    submitButton.innerHTML = `
        <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    submitButton.classList.add('loading');

    // Get input values
    const jobTitle = document.getElementById('jobTitle').value;
    const jobDescription = document.getElementById('jobDescription').value;
    const jobRequirements = document.getElementById('jobRequirements').value;
    const jobLocation = document.getElementById('jobLocation').value;
    const jobType = document.getElementById('jobType').value;
    const jobSalary = document.getElementById('jobSalary').value;

    const token = localStorage.getItem('token');
    if (!token) {
        errorToastNotification('Unauthorized. Please sign in.');
        submitButton.innerText = 'Post Job';
        submitButton.classList.remove('loading');
        return;
    }

    try {
        const response = await fetch('https://campusrecruitementsystem.onrender.com/jobs/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({
                jobTitle,
                jobDescription,
                jobRequirements,
                jobLocation,
                jobType,
                jobSalary
            })
        });

        const data = await response.json();

        if (response.ok) {
            successToastNotification(data.message || 'Job posted successfully!');
            document.getElementById('post-job-form').reset();
        } else {
            errorToastNotification(data.message || 'Failed to post job');
        }
    } catch (error) {
        console.error('Error posting job:', error);
        errorToastNotification('An error occurred while posting the job.');
    } finally {
        submitButton.innerText = 'Post Job';
        submitButton.classList.remove('loading');
    }
}
// Function to render the Manage Jobs screen
function renderManageJobsPage() {
    const container = document.getElementById('content');
    container.innerHTML = `
        <div class="dashboard">
            <h1>Manage Your Jobs</h1>
            <div id="manage-job-listings" class="jobs-container">
                <p>Loading your posted jobs...</p>
            </div>
        </div>
    `;

    fetchRecruiterJobs();
}

// Function to fetch jobs posted by the recruiter
async function fetchRecruiterJobs() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://campusrecruitementsystem.onrender.com/jobs', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            }
        });

        const data = await response.json();

        if (response.ok) {
            renderManageJobCards(data.jobs);
        } else {
            document.getElementById('manage-job-listings').innerHTML = '<p>No jobs found.</p>';
            errorToastNotification(data.message || 'Failed to fetch jobs');
        }
    } catch (error) {
        console.error('Error fetching jobs:', error);
        errorToastNotification('Error fetching jobs');
    }
}

// Function to render job cards for management
// Function to render job cards for management
function renderManageJobCards(jobs) {
    const jobListings = document.getElementById('manage-job-listings');
    jobListings.innerHTML = '';

    if (jobs.length === 0) {
        jobListings.innerHTML = '<p class="no-jobs-message">No jobs posted yet.</p>';
        return;
    }

    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'manage-job-card';
        jobCard.innerHTML = `
            <h3><strong>Job Title:</strong> ${job.jobTitle}</h3>
            <p><strong>Location:</strong> ${job.jobLocation}</p>
            <p><strong>Type:</strong> ${job.jobType}</p>
            <p><strong>Salary:</strong> $${job.jobSalary}</p>
            <p><strong>Requirements:</strong> ${job.jobRequirements}</p>
            <div class="btn-group">
                <button class="edit-btn" id="edit-${job._id}" onclick="handleEdit('${job._id}', '${job.jobTitle}', '${job.jobDescription}', '${job.jobRequirements}', '${job.jobLocation}', '${job.jobType}', '${job.jobSalary}')">Edit</button>
                <button class="delete-btn" id="delete-${job._id}" onclick="deleteJob('${job._id}')">Delete</button>
            </div>
        `;

        jobListings.appendChild(jobCard);
    });
}
function handleEdit(jobId, jobTitle, jobDescription, jobRequirements, jobLocation, jobType, jobSalary) {
    const editButton = document.getElementById(`edit-${jobId}`);

    if (editButton.classList.contains('loading')) return; // Prevent multiple clicks

    editButton.innerHTML = `
        <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    editButton.classList.add('loading');

    setTimeout(() => {
        openEditJobForm(jobId, jobTitle, jobDescription, jobRequirements, jobLocation, jobType, jobSalary);
        editButton.innerText = 'Edit';
        editButton.classList.remove('loading');
    }, 1000);
}
// Function to delete a job
async function deleteJob(jobId) {
    const deleteButton = document.getElementById(`delete-${jobId}`);

    if (deleteButton.classList.contains('loading')) return; // Prevent multiple clicks

    // Show loading animation
    deleteButton.innerHTML = `
        <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    deleteButton.classList.add('loading');

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://campusrecruitementsystem.onrender.com/jobs/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({ jobId })  // Send jobId in the request body
        });

        const data = await response.json();

        if (response.ok) {
            successToastNotification(data.message || 'Job deleted successfully!');
            fetchRecruiterJobs();  // Refresh the job list after deletion
        } else {
            errorToastNotification(data.message || 'Failed to delete the job');
            deleteButton.innerText = 'Delete';
        }
    } catch (error) {
        console.error('Error deleting job:', error);
        errorToastNotification('An error occurred while deleting the job.');
        deleteButton.innerText = 'Delete';
    } finally {
        deleteButton.classList.remove('loading');
    }
}



// Function to open the edit job form
// Function to handle updating the job
async function updateJob(event) {
    event.preventDefault();

    const submitButton = document.querySelector('.submit-btn');
    if (submitButton.classList.contains('loading')) return; // Prevent multiple clicks

    // Show loading animation
    submitButton.innerHTML = `
        <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    submitButton.classList.add('loading');

    // Get updated values from the form
    const jobId = document.getElementById('edit-jobId').value;
    const jobTitle = document.getElementById('edit-jobTitle').value;
    const jobDescription = document.getElementById('edit-jobDescription').value;
    const jobRequirements = document.getElementById('edit-jobRequirements').value;
    const jobLocation = document.getElementById('edit-jobLocation').value;
    const jobType = document.getElementById('edit-jobType').value;
    const jobSalary = document.getElementById('edit-jobSalary').value;

    const token = localStorage.getItem('token');
    if (!token) {
        errorToastNotification('Unauthorized. Please sign in.');
        submitButton.innerText = 'Update Job';
        submitButton.classList.remove('loading');
        return;
    }

    try {
        const response = await fetch('https://campusrecruitementsystem.onrender.com/jobs/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({
                jobId,
                jobTitle,
                jobDescription,
                jobRequirements,
                jobLocation,
                jobType,
                jobSalary
            })
        });

        const data = await response.json();

        if (response.ok) {
            successToastNotification(data.message || 'Job updated successfully!');
            renderManageJobsPage();
        } else {
            errorToastNotification(data.message || 'Failed to update job');
        }
    } catch (error) {
        console.error('Error updating job:', error);
        errorToastNotification('An error occurred while updating the job.');
    } finally {
        submitButton.innerText = 'Update Job';
        submitButton.classList.remove('loading');
    }
}

// Modify the openEditJobForm function to attach the update function
// Function to open the edit job form with field labels
function openEditJobForm(jobId, jobTitle, jobDescription, jobRequirements, jobLocation, jobType, jobSalary) {
    const container = document.getElementById('content');
    container.innerHTML = `
        <div class="dashboard">
            <h1>Edit Job</h1>
            <form id="edit-job-form" class="job-form">
                <input type="hidden" id="edit-jobId" value="${jobId}" />
                
                <div class="form-group">
                    <label for="edit-jobTitle">Job Title:</label>
                    <input type="text" id="edit-jobTitle" class="input-field" placeholder="Enter job title" value="${jobTitle}" required />
                </div>

                <div class="form-group">
                    <label for="edit-jobDescription">Job Description:</label>
                    <textarea id="edit-jobDescription" class="input-field" placeholder="Enter job description" required>${jobDescription}</textarea>
                </div>

                <div class="form-group">
                    <label for="edit-jobRequirements">Job Requirements:</label>
                    <input type="text" id="edit-jobRequirements" class="input-field" placeholder="Enter job requirements" value="${jobRequirements}" required />
                </div>

                <div class="form-group">
                    <label for="edit-jobLocation">Job Location:</label>
                    <input type="text" id="edit-jobLocation" class="input-field" placeholder="Enter job location" value="${jobLocation}" required />
                </div>

                <div class="form-group">
                    <label for="edit-jobType">Job Type:</label>
                    <select id="edit-jobType" class="input-field">
                        <option value="Full Time" ${jobType === 'Full Time' ? 'selected' : ''}>Full Time</option>
                        <option value="Part Time" ${jobType === 'Part Time' ? 'selected' : ''}>Part Time</option>
                        <option value="Internship" ${jobType === 'Internship' ? 'selected' : ''}>Internship</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="edit-jobSalary">Salary:</label>
                    <input type="number" id="edit-jobSalary" class="input-field" placeholder="Enter salary" value="${jobSalary}" required />
                </div>

                <div class="input-submit">
                    <button type="submit" class="submit-btn">Update Job</button>
                </div>
            </form>
        </div>
    `;

    // Attach event listener to form submission
    document.getElementById('edit-job-form').addEventListener('submit', updateJob);
}
// Function to render the Application Management screen
function renderApplicationsPage() {
    const container = document.getElementById('content');
    container.innerHTML = `
        <div class="dashboard">
            <h1>Application Management of the students</h1>
            <div id="application-listings" class="applications-container">
                <p class="loading-text">Loading applications...</p>
            </div>
        </div>
    `;

    fetchApplications();
}

// Function to fetch applications from backend
async function fetchApplications() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://campusrecruitementsystem.onrender.com/applications/recruiter', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            }
        });

        const data = await response.json();

        if (response.ok) {
            renderApplicationCards(data.applications);
        } else {
            document.getElementById('application-listings').innerHTML = '<p>No applications found.</p>';
            errorToastNotification(data.message || 'Failed to fetch applications');
        }
    } catch (error) {
        console.error('Error fetching applications:', error);
        errorToastNotification('Error fetching applications');
    }
}

// Function to render application cards dynamically
// Function to render application cards dynamically
function renderApplicationCards(applications) {
    const applicationListings = document.getElementById('application-listings');
    applicationListings.innerHTML = '';

    if (applications.length === 0) {
        applicationListings.innerHTML = '<p>No applications found.</p>';
        return;
    }

    applications.forEach(application => {
        const applicationCard = document.createElement('div');
        applicationCard.className = 'application-card';

        let actionButtons = '';
        if (application.status !== 'Accepted' && application.status !== 'Rejected') {
            actionButtons = `
                <div class="btn-group">
                    <button class="accept-btn" id="accept-${application._id}" onclick="handleAccept('${application._id}')">Accept</button>
                    <button class="reject-btn" id="reject-${application._id}" onclick="handleReject('${application._id}')">Reject</button>
                </div>
            `;
        }

        applicationCard.innerHTML = `
            <h3><strong>Job Title:</strong> ${application.jobID.jobTitle}</h3>
            <p><strong>Applicant Name:</strong> ${application.userID.userName}</p>
            <p><strong>Email of the Applicant:</strong> ${application.userID.email}</p>
            <p><strong>Application Status:</strong> ${application.status}</p>
            ${actionButtons}
        `;

        applicationListings.appendChild(applicationCard);
    });
}


// Placeholder functions for accept and reject buttons (functionality to be added later)
// Function to accept an application
async function handleAccept(applicationId) {
    const acceptButton = document.getElementById(`accept-${applicationId}`);
    if (acceptButton.classList.contains('loading')) return;

    // Show loading animation
    acceptButton.innerHTML = `
        <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    acceptButton.classList.add('loading');

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://campusrecruitementsystem.onrender.com/applications/update-status', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({ applicationId, status: 'Accepted' })
        });

        const data = await response.json();

        if (response.ok) {
            successToastNotification('Application accepted successfully!');
            document.getElementById(`accept-${applicationId}`).parentElement.parentElement.querySelector('p:nth-child(4)').innerHTML = '<strong>Application Status:</strong> Accepted';
            acceptButton.remove();
            document.getElementById(`reject-${applicationId}`).remove();
        } else {
            errorToastNotification(data.message || 'Failed to accept the application');
            acceptButton.innerText = 'Accept';
        }
    } catch (error) {
        console.error('Error accepting application:', error);
        errorToastNotification('Error processing the request');
        acceptButton.innerText = 'Accept';
    } finally {
        acceptButton.classList.remove('loading');
    }
}

// Function to reject an application
async function handleReject(applicationId) {
    const rejectButton = document.getElementById(`reject-${applicationId}`);
    if (rejectButton.classList.contains('loading')) return;

    // Show loading animation
    rejectButton.innerHTML = `
        <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    rejectButton.classList.add('loading');

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://campusrecruitementsystem.onrender.com/applications/update-status', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({ applicationId, status: 'Rejected' })
        });

        const data = await response.json();

        if (response.ok) {
            successToastNotification('Application rejected successfully!');
            document.getElementById(`reject-${applicationId}`).parentElement.parentElement.querySelector('p:nth-child(4)').innerHTML = '<strong>Application Status:</strong> Rejected';
            rejectButton.remove();
            document.getElementById(`accept-${applicationId}`).remove();
        } else {
            errorToastNotification(data.message || 'Failed to reject the application');
            rejectButton.innerText = 'Reject';
        }
    } catch (error) {
        console.error('Error rejecting application:', error);
        errorToastNotification('Error processing the request');
        rejectButton.innerText = 'Reject';
    } finally {
        rejectButton.classList.remove('loading');
    }
}







// Function to create and show a toast notification
function showToast(message, type = 'success', duration = 2500) {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <span class="close-btn">&times;</span>
        <div class="progress"></div>
    `;

    // Add click event to close button
    toast.querySelector('.close-btn').addEventListener('click', () => {
        toast.remove();
    });

    // Add progress animation
    setTimeout(() => {
        toast.querySelector('.progress').style.width = '0%';
    }, 100);

    // Remove toast after duration
    setTimeout(() => {
        toast.remove();
    }, duration);

    // Append toast to container
    toastContainer.appendChild(toast);
}

// Success toast notification function
function successToastNotification(message) {
    showToast(message, 'success');
}

// Error toast notification function
function errorToastNotification(message) {
    showToast(message, 'error');
}

// Info toast notification function
function infoToastNotification(message) {
    showToast(message, 'info');
}


// Logout function
function logout() {
    localStorage.clear();
    renderNavBar();
    renderSigninPage();
}

main();
