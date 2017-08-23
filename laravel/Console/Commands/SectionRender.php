<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Book;
use App\Section;
use Illuminate\Support\Collection;
use App\Jobs\SectionContentUpdate;
use Illuminate\Support\Facades\Bus;

class SectionRender extends Command
{
    protected $chunkSize = 3;

    protected $signature = 'book:section-render
                            { --all : Process all books and sections }
                            { --book= : A book ID to update all sections for }
                            { --section= : A section ID to update }
                            { --chunk=3 : The amount of sections to process per render }';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recompile section html via phantomjs';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    protected function handleBooks()
    {
        $startTime = time();
        $bookId = (integer) $this->option('book');

        // Ask user to render all books sections if no book id specified
        if (!$bookId && !$this->option('all')) {
            throw new \InvalidArgumentException('You must supply one of [--all|--book=|--section].');
        }

        $bookCollection = $this->getBooks($bookId);

        // Display an error if no books found
        if ($bookCollection->isEmpty()) {
            $this->error('No book(s) found!');
            return;
        }

        $this->updateBooks($bookCollection);

        $totalSecondsLasted = time() - $startTime;
        $minutesLasted = floor($totalSecondsLasted / 60);
        $secondsLasted = $totalSecondsLasted % 60;

        $this->line('');

        $this->info('Memory used: '. round(memory_get_usage() / (1024 * 1024) , 2) . 'Mb');

        $this->info("Finished after {$minutesLasted} mins {$secondsLasted} secs");
    }

    /**
     * Get books collection
     * @param integer $bookId
     * @return Collection
     */
    protected function getBooks($bookId = 0)
    {
        $sign = $bookId ? '=' : '>';
        return Book::withoutGlobalScopes()
            ->where('id', $sign, $bookId)
            ->get();
    }

    /**
     * @param Collection $bookCollection
     */
    protected function updateBooks($bookCollection)
    {
        $bar = $this->output->createProgressBar($bookCollection->count());

        $this->info('Starting a task...');

        $bar->start();

        $bookCollection->each(function ($book) use ($bar, $bookCollection)
        {
            $this->line('');
            $this->info("Processing book [$book->id] [$book->title]");

            $this->updateSections($book->sections);

            $bar->advance();

            $bookCollection->shift();
        });

        $bar->finish();
    }

    protected function handleSection()
    {
        $sectionId = (integer) $this->option('section');
        $section = Section::where('id', $sectionId)->firstOrFail();
        $this->updateSections(collect([$section]));

        $this->info("Section#{$sectionId} has been successfully updated");
    }

    /**
     * Update a section
     * @param Collection $sections
     */
    protected function updateSections($sections)
    {
        $bar = $this->output->createProgressBar($sections->count());

        // Split sections into chunks making phantomjs process live easier
        $sections->chunk($this->chunkSize)->each(function($subset) use ($bar)
        {
            $sectionRenderJob = new SectionContentUpdate($subset);
            Bus::dispatchNow($sectionRenderJob);
            $bar->advance($this->chunkSize);
        });

        $bar->finish();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $this->chunkSize = $this->option('chunk');

        if ($this->option('section')) {
            $this->handleSection();
        } else {
            $this->handleBooks();
        }
    }
}