<?php

namespace App\Jobs;

use App\Section;
use Illuminate\Support\Collection;
use App\Services\PageContent;
use Symfony\Component\DomCrawler\Crawler;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Bus\Queueable;

class SectionContentUpdate implements ShouldQueue
{
    use InteractsWithQueue,
        SerializesModels,
        Queueable;

    protected $sections;
    protected $elementCSS = '.editor-sections-content';
    protected $elementIdPrefix = '#section-';
    protected $compiledSectionsUrl = '/#!/compiled-sections?sectionIds=';
    protected $timeoutPerSection;

    /**
     * Create a new job instance.
     * @param Collection $sections
     * @return void
     */
    public function __construct(Collection $sections, $timeoutPerSection = 100)
    {
        $this->sections = $sections;
        $this->timeoutPerSection = (integer) $timeoutPerSection;
    }

    /**
     * Update section html with crawler's one
     * @param Section $section
     * @param Crawler $crawler
     * @throws \Exception
     */
    protected function updateHTML($section, $crawler)
    {
        $elementId = $this->elementIdPrefix.$section->id;
        try {
            $html = $crawler->filter($elementId.' .editor-content')->html();

            if (empty($html)) {
                throw new \Exception("Empty html for element [$elementId] in html: \n" . $crawler->html());
            }
        }
        catch (\InvalidArgumentException $ex) {
            throw new \Exception("Element [$elementId] in html: \n" . $crawler->html());
        }

        $section->html = $html;
        $section->save();
    }

    /**
     * @param Collection $sections
     * @return string
     */
    public function generateUrl($sections)
    {
        $ids = implode(',', $sections->pluck('id')->toArray());

        return url('/').$this->compiledSectionsUrl.$ids;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $sections = $this->sections;

        $timeout = $sections->count() * $this->timeoutPerSection;
        $process = new PageContent($this->generateUrl($sections), $this->elementCSS, $timeout);
        $process->mustRun();

        $crawler = new Crawler($process->getOutput());
        $sections->each(function($section) use ($crawler)
        {
            $this->updateHTML($section, $crawler);
        });
    }
}