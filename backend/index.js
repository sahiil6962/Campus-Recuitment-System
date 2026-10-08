const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const port = process.env.PORT;

//Database Part here
const Schema = mongoose.Schema;
const User = new Schema({
    userName: String,
    email: { type: String, unique: true },
    password: { type: String, required: true },
    role: { type: String },
}, { timestamps: true });
const Jobs = new Schema({
    jobTitle: String,
    jobRecruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'UserDetail' },
    jobDescription: String,
    jobRequirements: String,
    jobLocation: String,
    jobType: String,
    jobSalary: Number
}, { timestamps: true });
const Applications = new Schema({
    jobID: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPostings' },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'UserDetail' },
    status: { type: String, default: 'Pending' }
}, { timestamps: true });
const Profile = new Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'UserDetail' },
    firstName: String,
    lastName: String,
    company: String,
    education: String,
    skills: String
}, { timestamps: true });

const UserModel = mongoose.model('UserDetail', User);
const JobModel = mongoose.model('JobPostings', Jobs);
const ApplicationModel = mongoose.model('Applications', Applications);
const ProfileModel = mongoose.model('Profile', Profile);



async function connectToDataBase() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to database');
        startServer();
    } catch (error) {
        console.log('Error connecting to database', error);
    }
}
//Database part ends here
function auth(req, res, next) {
    const token = req.headers.token;
    try {
        const response = jwt.verify(token, process.env.JWT_SECRET);
        req.role = response.role;
        req.email = response.email;
        next()
    } catch (error) {
        return res.status(401).json({ message: 'Incorrect credentials' });
    }
}
function startServer() {
    async function hashPassword(password) {
        try {
            const hash = await bcrypt.hash(password, 10);
            return hash;
        } catch (error) {
            console.log('Error in hashing password', error);
            return null;
        }
    }
    async function verifyPassword(password, hashedPassword) {
        try {
            const match = await bcrypt.compare(password, hashedPassword);
            return match;
        } catch (error) {
            console.log('Error in verifying password', error);
            return false;
        }
    }
    app.post('/signup', async (req, res) => {
        const { email, password, role, username, recruiterAllowanceKey } = req.body;
        let user = await UserModel.findOne({ email });
        if (user) {
            return res.status(203).json({ message: 'Email is already registered!' });
        }
        try {
            let hashedPassword = await hashPassword(password);
            if (role === 'recruiter') {
                if (recruiterAllowanceKey !== process.env.RECRUITER_ALLOWANCE_KEY) {
                    return res.status(401).json({ message: 'Invalid recruiter allowance key' });
                }
                if (hashedPassword) {
                    let newUser = await UserModel.create({
                        email,
                        password: hashedPassword,
                        role,
                        userName: username
                    });

                    await ProfileModel.create({
                        userID: newUser._id,
                        firstName: '',
                        lastName: '',
                        company: '',
                        education: '',
                        skills: ''
                    });

                    console.log(newUser);
                    return res.status(201).json({ message: 'You are signed up and profile created!' });
                } else {
                    return res.status(500).json({ message: 'Error hashing password' });
                }
            } else if (role === 'student') {
                if (hashedPassword) {
                    let newUser = await UserModel.create({
                        email,
                        password: hashedPassword,
                        role,
                        userName: username
                    });

                    await ProfileModel.create({
                        userID: newUser._id,
                        firstName: '',
                        lastName: '',
                        company: '',
                        education: '',
                        skills: ''
                    });

                    console.log(newUser);
                    return res.status(201).json({ message: 'You are signed up and profile created!' });
                } else {
                    return res.status(500).json({ message: 'Error hashing password' });
                }
            } else return res.status(400).json({ message: 'Invalid role' });
        } catch (error) {
            if (error.code === 11000) {
                console.log(error);
                return res.status(403).json({ message: 'Email is already registered!' });
            } else {
                return res.status(500).json({ message: 'Internal server error' });
            }
        }
    });
    app.post('/signin', async (req, res) => {
        const { email, password, role } = req.body;
        try {
            let user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (user.role !== role) {
                return res.status(401).json({ message: 'Invalid role' });
            }
            let isPasswordValid = await verifyPassword(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid password' });
            }
            const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET);
            return res.status(200).json({ token });
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    })
    //Recruiters only endpoint
    //Recruiter can post a job
    app.post('/jobs/post', auth, async (req, res) => {
        let role = req.role
        let recruiterEmail = req.email
        let { jobTitle, jobDescription, jobRequirements, jobLocation, jobType, jobSalary } = req.body;
        try {
            if (role !== 'recruiter') {
                return res.status(401).json({ message: 'Unauthorized' })
            }
            let recruiter = await UserModel.findOne({ email: recruiterEmail });
            let response = await JobModel.create({
                jobTitle,
                jobDescription,
                jobRequirements,
                jobLocation,
                jobType,
                jobSalary,
                jobRecruiter: recruiter._id
            });
            console.log(response);
            return res.status(201).json({ message: 'Job posted successfully', response });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error', error });
        }
    })
    //Recruiter can view all the jobs listed by him/her
    app.get('/jobs', auth, async (req, res) => {
        try {
            if (req.role !== 'recruiter') {
                return res.status(401).json({ message: 'Unauthorized: Only recruiters can view jobs' });
            }
            let recruiter = await UserModel.findOne({ email: req.email });
            if (!recruiter) {
                return res.status(404).json({ message: 'Recruiter not found' });
            }
            let jobs = await JobModel.find({ jobRecruiter: recruiter._id });
            res.status(200).json({ message: 'Jobs fetched successfully', jobs });
        } catch (error) {
            console.error('Error fetching jobs:', error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    });
    app.put('/jobs/update', auth, async (req, res) => {
        const { jobId, jobTitle, jobDescription, jobRequirements, jobLocation, jobType, jobSalary } = req.body;

        if (!jobId) {
            return res.status(400).json({ message: 'Job ID is required' });
        }

        try {
            let job = await JobModel.findById(jobId);
            if (!job) {
                return res.status(404).json({ message: 'Job not found' });
            }

            job.jobTitle = jobTitle || job.jobTitle;
            job.jobDescription = jobDescription || job.jobDescription;
            job.jobRequirements = jobRequirements || job.jobRequirements;
            job.jobLocation = jobLocation || job.jobLocation;
            job.jobType = jobType || job.jobType;
            job.jobSalary = jobSalary || job.jobSalary;
            await job.save();

            res.status(200).json({ message: 'Job updated successfully', job });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error });
        }
    });
    app.delete('/jobs/delete', auth, async (req, res) => {
        const { jobId } = req.body;
        try {
            if (req.role !== 'recruiter') {
                return res.status(401).json({ message: 'Unauthorized: Only recruiters can delete jobs' });
            }

            let recruiter = await UserModel.findOne({ email: req.email });
            if (!recruiter) {
                return res.status(404).json({ message: 'Recruiter not found' });
            }

            if (!jobId) {
                return res.status(400).json({ message: 'Job ID is required' });
            }

            let job = await JobModel.findOne({ _id: jobId, jobRecruiter: recruiter._id });

            if (!job) {
                return res.status(403).json({ message: 'You are not authorized to delete this job or job not found' });
            }

            await JobModel.deleteOne({ _id: jobId });

            res.status(200).json({ message: 'Job deleted successfully' });
        } catch (error) {
            console.error('Error deleting job:', error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    });
    // Recruiter can view all applications for their posted jobs
    app.get('/applications/recruiter', auth, async (req, res) => {
        try {
            if (req.role !== 'recruiter') {
                return res.status(401).json({ message: 'Unauthorized: Only recruiters can view applications' });
            }

            let recruiter = await UserModel.findOne({ email: req.email });
            if (!recruiter) {
                return res.status(404).json({ message: 'Recruiter not found' });
            }

            // Find jobs posted by the recruiter
            let jobs = await JobModel.find({ jobRecruiter: recruiter._id }).select('_id');

            if (jobs.length === 0) {
                return res.status(404).json({ message: 'No jobs found for this recruiter' });
            }

            const jobIds = jobs.map(job => job._id);

            // Find applications related to those jobs
            let applications = await ApplicationModel.find({ jobID: { $in: jobIds } })
                .populate('jobID', 'jobTitle')
                .populate('userID', 'userName email');

            if (applications.length === 0) {
                return res.status(404).json({ message: 'No applications found for your jobs' });
            }

            res.status(200).json({ message: 'Applications fetched successfully', applications });
        } catch (error) {
            console.error('Error fetching recruiter applications:', error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    });
    // Endpoint to update application status (accept/reject)
    app.put('/applications/update-status', auth, async (req, res) => {
        const { applicationId, status } = req.body;

        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        try {
            const application = await ApplicationModel.findById(applicationId);

            if (!application) {
                return res.status(404).json({ message: 'Application not found' });
            }

            application.status = status;
            await application.save();

            res.status(200).json({ message: `Application ${status.toLowerCase()} successfully` });
        } catch (error) {
            console.error('Error updating application status:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    //Recruiters only endpoint ends here
    //Students only endpoint
    app.post('/applications/apply', auth, async (req, res) => {
        const { jobId } = req.body;

        try {
            if (req.role !== 'student') {
                return res.status(401).json({ message: 'Unauthorized: Only students can apply for jobs' });
            }

            let student = await UserModel.findOne({ email: req.email });
            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            let job = await JobModel.findById(jobId);
            if (!job) {
                return res.status(404).json({ message: 'Job not found' });
            }

            let existingApplication = await ApplicationModel.findOne({
                jobID: jobId,
                userID: student._id
            });

            if (existingApplication) {
                return res.status(400).json({ message: 'You have already applied for this job' });
            }

            let application = await ApplicationModel.create({
                jobID: jobId,
                userID: student._id,
                status: 'Pending'
            });

            res.status(201).json({ message: 'Application submitted successfully', application });
        } catch (error) {
            console.error('Error applying for job:', error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    });
    app.get('/applications', auth, async (req, res) => {
        try {
            if (req.role !== 'student') {
                return res.status(401).json({ message: 'Unauthorized: Only students can view their applications' });
            }

            let student = await UserModel.findOne({ email: req.email });
            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            let applications = await ApplicationModel.find({ userID: student._id }).populate('jobID', 'jobTitle jobLocation jobType jobSalary');

            res.status(200).json({ message: 'Applications fetched successfully', applications });
        } catch (error) {
            console.error('Error fetching applications:', error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    });
    app.delete('/applications/withdraw', auth, async (req, res) => {
        const { applicationId } = req.body;

        try {
            if (req.role !== 'student') {
                return res.status(401).json({ message: 'Unauthorized: Only students can withdraw applications' });
            }

            let student = await UserModel.findOne({ email: req.email });
            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            let application = await ApplicationModel.findOne({
                _id: applicationId,
                userID: student._id
            });

            if (!application) {
                return res.status(403).json({ message: 'Application not found or unauthorized action' });
            }

            await ApplicationModel.deleteOne({ _id: applicationId });

            res.status(200).json({ message: 'Application withdrawn successfully' });
        } catch (error) {
            console.error('Error withdrawing application:', error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    });
    app.get('/profile', auth, async (req, res) => {
        try {
            let user = await UserModel.findOne({ email: req.email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            let profile = await ProfileModel.findOne({ userID: user._id });

            if (!profile) {
                return res.status(404).json({ message: 'Profile not found' });
            }

            res.status(200).json({ message: 'Profile fetched successfully', profile });
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    });
    app.put('/profile/update', auth, async (req, res) => {
        const { firstName, lastName, company, education, skills } = req.body;

        try {
            let user = await UserModel.findOne({ email: req.email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            let profile = await ProfileModel.findOne({ userID: user._id });

            if (!profile) {
                return res.status(404).json({ message: 'Profile not found' });
            }

            profile.firstName = firstName || profile.firstName;
            profile.lastName = lastName || profile.lastName;
            profile.company = company || profile.company;
            profile.education = education || profile.education;
            profile.skills = skills || profile.skills;

            await profile.save();

            res.status(200).json({ message: 'Profile updated successfully', profile });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    });
    //Searching and filtering endpoint
    app.post('/jobs/search', auth, async (req, res) => {
        try {
            const { jobTitle, jobLocation, jobType, minSalary, maxSalary } = req.body;

            let filter = {};

            if (jobTitle) {
                filter.jobTitle = { $regex: jobTitle, $options: 'i' };  // Case-insensitive search
            }
            if (jobLocation) {
                filter.jobLocation = { $regex: jobLocation, $options: 'i' };
            }
            if (jobType) {
                filter.jobType = jobType;
            }
            if (minSalary) {
                filter.jobSalary = { $gte: Number(minSalary) };
            }
            if (maxSalary) {
                filter.jobSalary = { ...filter.jobSalary, $lte: Number(maxSalary) };
            }

            let jobs = await JobModel.find(filter);

            if (req.role === 'student') {
                const student = await UserModel.findOne({ email: req.email });
                const appliedJobs = await ApplicationModel.find({ userID: student._id }).select('jobID');

                // Remove applied jobs from the job list
                const appliedJobIds = appliedJobs.map(app => app.jobID.toString());
                jobs = jobs.filter(job => !appliedJobIds.includes(job._id.toString()));
            }

            if (jobs.length === 0) {
                return res.status(404).json({ message: 'No jobs found matching the criteria' });
            }

            res.status(200).json({ message: 'Jobs fetched successfully', jobs });
        } catch (error) {
            console.error('Error searching jobs:', error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    });
}
connectToDataBase();
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});